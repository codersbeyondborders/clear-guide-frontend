'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, EyeOff, Loader2, ChevronRight, ChevronLeft,
  Check, Type, Contrast, Zap, Monitor, Palette,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { createEndUserProfile, signInWithGoogle } from '@/lib/auth-helpers'
import type { AgeGroup, FontSizePref, ColorBlindMode } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Step1Data {
  name: string
  email: string
  password: string
}

interface Step2Data {
  ageGroup: AgeGroup | ''
  fontSizePref: FontSizePref
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
  colorBlindMode: ColorBlindMode
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'under_18', label: 'Under 18' },
  { value: '18_34',    label: '18 – 34'  },
  { value: '35_54',    label: '35 – 54'  },
  { value: '55_64',    label: '55 – 64'  },
  { value: '65_plus',  label: '65 +'     },
]

const FONT_OPTIONS: { value: FontSizePref; label: string; sample: string }[] = [
  { value: 'small',  label: 'Small',   sample: 'text-xs'   },
  { value: 'medium', label: 'Medium',  sample: 'text-sm'   },
  { value: 'large',  label: 'Large',   sample: 'text-base' },
  { value: 'xlarge', label: 'X-Large', sample: 'text-lg'   },
]

const COLOR_BLIND_OPTIONS: { value: ColorBlindMode; label: string; desc: string }[] = [
  { value: 'none',         label: 'None',        desc: 'Standard colour display'  },
  { value: 'deuteranopia', label: 'Deuteranopia', desc: 'Red-green (most common)' },
  { value: 'protanopia',   label: 'Protanopia',   desc: 'Red-green (less common)' },
  { value: 'tritanopia',   label: 'Tritanopia',   desc: 'Blue-yellow'             },
]

// ─── Toggle Card ─────────────────────────────────────────────────────────────

function ToggleCard({
  id, label, description, icon: Icon, checked, onChange,
}: {
  id: string
  label: string
  description: string
  icon: React.FC<{ className?: string; style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring"
      style={{
        borderColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: checked ? 'var(--color-primary-subtle)' : 'var(--color-card)',
      }}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Icon
        className="w-4 h-4 mt-0.5 shrink-0"
        style={{ color: checked ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
      />
      <span className="min-w-0 flex-1">
        <span
          className="block text-sm font-semibold leading-snug"
          style={{ color: 'var(--color-foreground)' }}
        >
          {label}
        </span>
        <span
          className="block text-xs leading-relaxed mt-0.5"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          {description}
        </span>
      </span>
      {checked && (
        <Check
          className="w-4 h-4 shrink-0 mt-0.5"
          style={{ color: 'var(--color-primary)' }}
          aria-hidden
        />
      )}
    </label>
  )
}

// ─── Google Button ────────────────────────────────────────────────────────────

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
    >
      {/* Google "G" SVG */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {loading ? 'Connecting...' : 'Continue with Google'}
    </button>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
        or
      </span>
      <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  redirectTo?: string
}

export function EndUserSignUpForm({ redirectTo = '/user' }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1
  const [step1, setStep1] = useState<Step1Data>({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [step1Errors, setStep1Errors] = useState<Partial<Step1Data>>({})

  // Step 2
  const [step2, setStep2] = useState<Step2Data>({
    ageGroup: '',
    fontSizePref: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    colorBlindMode: 'none',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ── Step 1 validation ──────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const errs: Partial<Step1Data> = {}
    if (!step1.name.trim()) errs.name = 'Full name is required'
    if (!step1.email.includes('@')) errs.email = 'Enter a valid email address'
    if (step1.password.length < 6) errs.password = 'Password must be at least 6 characters'
    setStep1Errors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  // ── Google sign-up ─────────────────────────────────────────────────────────

  async function handleGoogleSignUp() {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithGoogle()
      // Google sign-up creates profile with defaults; skip to prefs step
      setStep(2)
    } catch (err: any) {
      setError(err?.message || 'Google sign-up failed')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Final submit ───────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        step1.email,
        step1.password
      )
      if (step1.name) {
        await updateProfile(userCredential.user, { displayName: step1.name })
      }

      await createEndUserProfile({
        uid: userCredential.user.uid,
        name: step1.name,
        email: step1.email,
        ageGroup: step2.ageGroup || null,
        fontSizePref: step2.fontSizePref,
        highContrast: step2.highContrast,
        reducedMotion: step2.reducedMotion,
        screenReader: step2.screenReader,
        colorBlindMode: step2.colorBlindMode,
      })

      setSuccess('Account created! Redirecting…')
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1200)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Google prefs submit (after Google sign-up) ──────────────────────────────

  async function handleGooglePrefsSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { auth: firebaseAuth } = await import('@/lib/firebase')
      const currentUser = firebaseAuth.currentUser
      if (!currentUser) throw new Error('No signed-in user')

      // Update profile with accessibility prefs
      const { getEndUserProfile } = await import('@/lib/auth-helpers')
      const existing = await getEndUserProfile(currentUser.uid)

      if (existing) {
        const { doc, updateDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        await updateDoc(doc(db, 'users', currentUser.uid), {
          ageGroup: step2.ageGroup || null,
          fontSizePref: step2.fontSizePref,
          highContrast: step2.highContrast,
          reducedMotion: step2.reducedMotion,
          screenReader: step2.screenReader,
          colorBlindMode: step2.colorBlindMode,
          updatedAt: new Date().toISOString(),
        })
      }

      setSuccess('Preferences saved! Redirecting…')
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1200)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = ['Account', 'Personalise']

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Step progress */}
      <nav aria-label="Sign-up progress" className="flex items-center justify-center gap-0">
        {steps.map((label, i) => {
          const num = i + 1
          const isActive = step === num
          const isDone = step > num
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: isActive || isDone ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isActive || isDone ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                  }}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? <Check className="w-4 h-4" aria-hidden /> : num}
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-16 h-px mt-[-14px] mx-2"
                  style={{ backgroundColor: step > 1 ? 'var(--color-primary)' : 'var(--color-border)' }}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </nav>

      {/* ── STEP 1: Account ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          {/* Google button */}
          <GoogleButton onClick={handleGoogleSignUp} loading={isLoading} />
          <OrDivider />

          <form onSubmit={handleNextStep} noValidate className="flex flex-col gap-4" aria-label="Account details">
            <div aria-live="polite" aria-atomic className="sr-only">Step 1 of 2: Enter your account details</div>

            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="eu-name" className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                Full name <span aria-hidden="true" style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <input
                id="eu-name"
                type="text"
                autoComplete="name"
                required
                value={step1.name}
                onChange={(e) => { setStep1((p) => ({ ...p, name: e.target.value })); setStep1Errors((p) => ({ ...p, name: undefined })) }}
                placeholder="Jane Smith"
                className="auth-input"
                style={step1Errors.name ? { borderColor: 'var(--color-destructive)' } : undefined}
                aria-describedby={step1Errors.name ? 'eu-name-error' : undefined}
                aria-invalid={!!step1Errors.name}
              />
              {step1Errors.name && (
                <p id="eu-name-error" role="alert" className="text-xs" style={{ color: 'var(--color-destructive)' }}>{step1Errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="eu-email" className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                Email address <span aria-hidden="true" style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <input
                id="eu-email"
                type="email"
                autoComplete="email"
                required
                value={step1.email}
                onChange={(e) => { setStep1((p) => ({ ...p, email: e.target.value })); setStep1Errors((p) => ({ ...p, email: undefined })) }}
                placeholder="you@example.com"
                className="auth-input"
                style={step1Errors.email ? { borderColor: 'var(--color-destructive)' } : undefined}
                aria-describedby={step1Errors.email ? 'eu-email-error' : undefined}
                aria-invalid={!!step1Errors.email}
              />
              {step1Errors.email && (
                <p id="eu-email-error" role="alert" className="text-xs" style={{ color: 'var(--color-destructive)' }}>{step1Errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="eu-password" className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                Password <span aria-hidden="true" style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <div className="relative">
                <input
                  id="eu-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={step1.password}
                  onChange={(e) => { setStep1((p) => ({ ...p, password: e.target.value })); setStep1Errors((p) => ({ ...p, password: undefined })) }}
                  placeholder="Min. 6 characters"
                  className="auth-input pr-10"
                  style={step1Errors.password ? { borderColor: 'var(--color-destructive)' } : undefined}
                  aria-describedby={step1Errors.password ? 'eu-pw-error' : 'eu-pw-hint'}
                  aria-invalid={!!step1Errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {step1Errors.password
                ? <p id="eu-pw-error" role="alert" className="text-xs" style={{ color: 'var(--color-destructive)' }}>{step1Errors.password}</p>
                : <p id="eu-pw-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>At least 6 characters</p>
              }
            </div>

            {error && (
              <p role="alert" aria-live="polite" className="text-sm rounded-lg px-3 py-2 border"
                style={{ color: 'var(--color-destructive)', borderColor: 'color-mix(in srgb, var(--color-destructive) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}>
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-1">
              Continue
              <ChevronRight className="w-4 h-4" aria-hidden />
            </button>

            <p className="text-sm text-center" style={{ color: 'var(--color-muted-foreground)' }}>
              Already have an account?{' '}
              <Link href="/user/sign-in" className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" style={{ color: 'var(--color-primary)' }}>
                Sign in
              </Link>
            </p>
          </form>
        </div>
      )}

      {/* ── STEP 2: Personalise ──────────────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={step1.email ? handleSubmit : handleGooglePrefsSubmit} noValidate className="flex flex-col gap-5" aria-label="Personalise your experience">
          <div aria-live="polite" aria-atomic className="sr-only">Step 2 of 2: Set your personalisation preferences</div>

          {/* Age group */}
          <fieldset>
            <legend className="text-sm font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
              Age group{' '}
              <span className="font-normal text-xs ml-1" style={{ color: 'var(--color-muted-foreground)' }}>
                (optional — helps personalise your layout)
              </span>
            </legend>
            <div className="flex flex-wrap gap-2" role="group">
              {AGE_OPTIONS.map((opt) => {
                const sel = step2.ageGroup === opt.value
                return (
                  <label
                    key={opt.value}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring"
                    style={{
                      borderColor: sel ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: sel ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                      color: sel ? 'var(--color-primary)' : 'var(--color-foreground)',
                    }}
                  >
                    <input
                      type="radio"
                      name="ageGroup"
                      value={opt.value}
                      className="sr-only"
                      checked={sel}
                      onChange={() => setStep2((p) => ({ ...p, ageGroup: opt.value }))}
                    />
                    {opt.label}
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Font size */}
          <fieldset>
            <legend className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-foreground)' }}>
              <Type className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
              Preferred text size
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {FONT_OPTIONS.map((opt) => {
                const sel = step2.fontSizePref === opt.value
                return (
                  <label
                    key={opt.value}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring"
                    style={{
                      borderColor: sel ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: sel ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                    }}
                  >
                    <input
                      type="radio"
                      name="fontSizePref"
                      value={opt.value}
                      className="sr-only"
                      checked={sel}
                      onChange={() => setStep2((p) => ({ ...p, fontSizePref: opt.value }))}
                    />
                    <span className={`${opt.sample} font-bold leading-none`} style={{ color: sel ? 'var(--color-primary)' : 'var(--color-foreground)' }}>
                      Aa
                    </span>
                    <span className="text-xs font-medium text-center" style={{ color: sel ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
                      {opt.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Accessibility toggles */}
          <fieldset>
            <legend className="text-sm font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
              Accessibility preferences
            </legend>
            <div className="flex flex-col gap-2">
              <ToggleCard id="high-contrast" label="High contrast" description="Increases colour contrast for better readability" icon={Contrast} checked={step2.highContrast} onChange={(v) => setStep2((p) => ({ ...p, highContrast: v }))} />
              <ToggleCard id="reduced-motion" label="Reduced motion" description="Minimises animations and transitions" icon={Zap} checked={step2.reducedMotion} onChange={(v) => setStep2((p) => ({ ...p, reducedMotion: v }))} />
              <ToggleCard id="screen-reader" label="Screen reader" description="Optimises layout and aria labels for assistive technology" icon={Monitor} checked={step2.screenReader} onChange={(v) => setStep2((p) => ({ ...p, screenReader: v }))} />
            </div>
          </fieldset>

          {/* Colour-blind mode */}
          <fieldset>
            <legend className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-foreground)' }}>
              <Palette className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
              Colour vision
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_BLIND_OPTIONS.map((opt) => {
                const sel = step2.colorBlindMode === opt.value
                return (
                  <label
                    key={opt.value}
                    className="flex flex-col gap-0.5 p-3 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring"
                    style={{
                      borderColor: sel ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: sel ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                    }}
                  >
                    <input
                      type="radio"
                      name="colorBlindMode"
                      value={opt.value}
                      className="sr-only"
                      checked={sel}
                      onChange={() => setStep2((p) => ({ ...p, colorBlindMode: opt.value }))}
                    />
                    <span className="text-sm font-semibold" style={{ color: sel ? 'var(--color-primary)' : 'var(--color-foreground)' }}>
                      {opt.label}
                    </span>
                    <span className="text-xs leading-snug" style={{ color: 'var(--color-muted-foreground)' }}>
                      {opt.desc}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Alerts */}
          {error && (
            <p role="alert" aria-live="polite" className="text-sm rounded-lg px-3 py-2 border"
              style={{ color: 'var(--color-destructive)', borderColor: 'color-mix(in srgb, var(--color-destructive) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}>
              {error}
            </p>
          )}
          {success && (
            <p role="status" aria-live="polite" className="text-sm rounded-lg px-3 py-2 border"
              style={{ color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', backgroundColor: 'var(--color-primary-subtle)' }}>
              {success}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isLoading || !!success}
              className="btn-outline flex items-center justify-center gap-1.5 flex-1 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !!success}
              className="btn-primary flex items-center justify-center gap-2 flex-[2] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              Create account
            </button>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            These settings can be changed any time in your{' '}
            <span className="font-medium" style={{ color: 'var(--color-foreground)' }}>profile settings</span>.
          </p>
        </form>
      )}
    </div>
  )
}
