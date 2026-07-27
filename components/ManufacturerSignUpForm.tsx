'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, EyeOff, Loader2, ChevronRight, ChevronLeft,
  Check, Building2, Globe, Briefcase, FileText,
} from 'lucide-react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createManufacturerProfile } from '@/lib/auth-helpers'

// ─── Industry Options ─────────────────────────────────────────────────────────

const INDUSTRIES = [
  'Consumer Electronics',
  'Home Appliances',
  'Industrial Equipment',
  'Automotive',
  'Medical Devices',
  'Furniture & Interior',
  'Power Tools',
  'Outdoor & Garden',
  'Sporting Goods',
  'Toys & Games',
  'Food & Beverage Equipment',
  'Other',
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1Data {
  name: string
  email: string
  password: string
}

interface Step2Data {
  companyName: string
  industry: string
  website: string
  description: string
}

// ─── Form field component ─────────────────────────────────────────────────────

function Field({
  id, label, required, error, children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
        {label}
        {required && <span aria-hidden="true" style={{ color: 'var(--color-destructive)' }}> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs" style={{ color: 'var(--color-destructive)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  redirectTo?: string
}

export function ManufacturerSignUpForm({ redirectTo = '/manufacturer/dashboard' }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 — Account
  const [step1, setStep1] = useState<Step1Data>({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [step1Errors, setStep1Errors] = useState<Partial<Step1Data>>({})

  // Step 2 — Company
  const [step2, setStep2] = useState<Step2Data>({
    companyName: '',
    industry: '',
    website: '',
    description: '',
  })
  const [step2Errors, setStep2Errors] = useState<Partial<Step2Data>>({})

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ── Validation ────────────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const errs: Partial<Step1Data> = {}
    if (!step1.name.trim()) errs.name = 'Full name is required'
    if (!step1.email.includes('@')) errs.email = 'Enter a valid work email'
    if (step1.password.length < 8) errs.password = 'Password must be at least 8 characters'
    setStep1Errors(errs)
    return Object.keys(errs).length === 0
  }

  function validateStep2(): boolean {
    const errs: Partial<Step2Data> = {}
    if (!step2.companyName.trim()) errs.companyName = 'Company name is required'
    if (!step2.industry) errs.industry = 'Please select an industry'
    setStep2Errors(errs)
    return Object.keys(errs).length === 0
  }

  function handleStep1Next(e: React.FormEvent) {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  function handleStep2Next(e: React.FormEvent) {
    e.preventDefault()
    if (validateStep2()) setStep(3)
  }

  // ── Final submit ──────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const credential = await createUserWithEmailAndPassword(auth, step1.email, step1.password)
      await updateProfile(credential.user, { displayName: step1.name })

      await createManufacturerProfile({
        uid: credential.user.uid,
        name: step1.name,
        email: step1.email,
        companyName: step2.companyName,
        industry: step2.industry || null,
        website: step2.website || null,
        description: step2.description || null,
      })

      setSuccess('Company account created! Redirecting to your dashboard…')
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1400)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step labels ───────────────────────────────────────────────────────────

  const STEPS = ['Account', 'Company', 'Review']

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <nav aria-label="Registration progress" className="flex items-center justify-center">
        {STEPS.map((label, i) => {
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
              {i < STEPS.length - 1 && (
                <div
                  className="w-14 h-px mt-[-14px] mx-2"
                  style={{ backgroundColor: step > num ? 'var(--color-primary)' : 'var(--color-border)' }}
                  aria-hidden
                />
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Step 1: Account ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleStep1Next} noValidate className="flex flex-col gap-4" aria-label="Account details">
          <div aria-live="polite" aria-atomic className="sr-only">Step 1 of 3: Enter your account details</div>

          <Field id="mfg-name" label="Full name" required error={step1Errors.name}>
            <input
              id="mfg-name"
              type="text"
              autoComplete="name"
              required
              value={step1.name}
              onChange={(e) => { setStep1((p) => ({ ...p, name: e.target.value })); setStep1Errors((p) => ({ ...p, name: undefined })) }}
              placeholder="Jane Smith"
              className="auth-input"
              style={step1Errors.name ? { borderColor: 'var(--color-destructive)' } : undefined}
              aria-invalid={!!step1Errors.name}
              aria-describedby={step1Errors.name ? 'mfg-name-error' : undefined}
            />
          </Field>

          <Field id="mfg-email" label="Work email" required error={step1Errors.email}>
            <input
              id="mfg-email"
              type="email"
              autoComplete="email"
              required
              value={step1.email}
              onChange={(e) => { setStep1((p) => ({ ...p, email: e.target.value })); setStep1Errors((p) => ({ ...p, email: undefined })) }}
              placeholder="jane@yourcompany.com"
              className="auth-input"
              style={step1Errors.email ? { borderColor: 'var(--color-destructive)' } : undefined}
              aria-invalid={!!step1Errors.email}
              aria-describedby={step1Errors.email ? 'mfg-email-error' : undefined}
            />
          </Field>

          <Field id="mfg-password" label="Password" required error={step1Errors.password}>
            <div className="relative">
              <input
                id="mfg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={step1.password}
                onChange={(e) => { setStep1((p) => ({ ...p, password: e.target.value })); setStep1Errors((p) => ({ ...p, password: undefined })) }}
                placeholder="Min. 8 characters"
                className="auth-input pr-10"
                style={step1Errors.password ? { borderColor: 'var(--color-destructive)' } : undefined}
                aria-invalid={!!step1Errors.password}
                aria-describedby={step1Errors.password ? 'mfg-password-error' : 'mfg-pw-hint'}
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
            {!step1Errors.password && (
              <p id="mfg-pw-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>At least 8 characters</p>
            )}
          </Field>

          <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-1">
            Continue
            <ChevronRight className="w-4 h-4" aria-hidden />
          </button>

          <p className="text-sm text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Already have an account?{' '}
            <Link href="/manufacturer/sign-in" className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" style={{ color: 'var(--color-primary)' }}>
              Sign in
            </Link>
          </p>
        </form>
      )}

      {/* ── Step 2: Company Details ─────────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={handleStep2Next} noValidate className="flex flex-col gap-4" aria-label="Company details">
          <div aria-live="polite" aria-atomic className="sr-only">Step 2 of 3: Enter your company details</div>

          <Field id="mfg-company" label="Company name" required error={step2Errors.companyName}>
            <div className="relative">
              <Building2
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-hidden="true"
              />
              <input
                id="mfg-company"
                type="text"
                required
                value={step2.companyName}
                onChange={(e) => { setStep2((p) => ({ ...p, companyName: e.target.value })); setStep2Errors((p) => ({ ...p, companyName: undefined })) }}
                placeholder="Acme Manufacturing Co."
                className="auth-input pl-9"
                style={step2Errors.companyName ? { borderColor: 'var(--color-destructive)' } : undefined}
                aria-invalid={!!step2Errors.companyName}
                aria-describedby={step2Errors.companyName ? 'mfg-company-error' : undefined}
              />
            </div>
          </Field>

          <Field id="mfg-industry" label="Industry" required error={step2Errors.industry}>
            <div className="relative">
              <Briefcase
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-hidden="true"
              />
              <select
                id="mfg-industry"
                required
                value={step2.industry}
                onChange={(e) => { setStep2((p) => ({ ...p, industry: e.target.value })); setStep2Errors((p) => ({ ...p, industry: undefined })) }}
                className="auth-input pl-9 appearance-none"
                style={step2Errors.industry ? { borderColor: 'var(--color-destructive)' } : undefined}
                aria-invalid={!!step2Errors.industry}
                aria-describedby={step2Errors.industry ? 'mfg-industry-error' : undefined}
              >
                <option value="" disabled>Select your industry</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </Field>

          <Field id="mfg-website" label="Website" error={undefined}>
            <div className="relative">
              <Globe
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-hidden="true"
              />
              <input
                id="mfg-website"
                type="url"
                value={step2.website}
                onChange={(e) => setStep2((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://yourcompany.com (optional)"
                className="auth-input pl-9"
              />
            </div>
          </Field>

          <Field id="mfg-desc" label="Company description" error={undefined}>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-hidden="true"
              />
              <textarea
                id="mfg-desc"
                rows={3}
                value={step2.description}
                onChange={(e) => setStep2((p) => ({ ...p, description: e.target.value }))}
                placeholder="Briefly describe what your company makes (optional)"
                className="auth-input pl-9 resize-none"
              />
            </div>
          </Field>

          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-outline flex items-center justify-center gap-1.5 flex-1"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
              Back
            </button>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2 flex-[2]">
              Review & Create
              <ChevronRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
        </form>
      )}

      {/* ── Step 3: Review & Submit ─────────────────────────────────────────── */}
      {step === 3 && (
        <form onSubmit={handleSubmit} noValidate aria-label="Review and create account">
          <div aria-live="polite" aria-atomic className="sr-only">Step 3 of 3: Review your details and create your account</div>

          {/* Summary card */}
          <div
            className="rounded-xl border divide-y mb-5"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          >
            {/* Account section */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Account</p>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{step1.name}</p>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{step1.email}</p>
              </div>
            </div>

            {/* Company section */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Company</p>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{step2.companyName}</p>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{step2.industry}</p>
                {step2.website && <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{step2.website}</p>}
                {step2.description && <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>{step2.description}</p>}
              </div>
            </div>

            {/* Role */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Your role</p>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                  color: 'var(--color-primary)',
                  borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                }}
              >
                <Building2 className="w-3 h-3" aria-hidden="true" />
                Owner
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted-foreground)' }}>
                You can invite team members after setup.
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <p role="alert" aria-live="polite" className="text-sm rounded-lg px-3 py-2 border mb-4"
              style={{ color: 'var(--color-destructive)', borderColor: 'color-mix(in srgb, var(--color-destructive) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}>
              {error}
            </p>
          )}
          {success && (
            <p role="status" aria-live="polite" className="text-sm rounded-lg px-3 py-2 border mb-4"
              style={{ color: 'var(--color-primary)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', backgroundColor: 'var(--color-primary-subtle)' }}>
              {success}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={isLoading || !!success}
              className="btn-outline flex items-center justify-center gap-1.5 flex-1 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
              Edit
            </button>
            <button
              type="submit"
              id="mfg-create-account"
              disabled={isLoading || !!success}
              className="btn-primary flex items-center justify-center gap-2 flex-[2] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              Create company account
            </button>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--color-muted-foreground)' }}>
            By creating an account you agree to our{' '}
            <Link href="/terms" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Privacy Policy</Link>.
          </p>
        </form>
      )}
    </div>
  )
}
