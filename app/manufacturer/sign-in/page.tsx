'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, BookOpen, Building2, ArrowLeft } from 'lucide-react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

function ManufacturerSignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/manufacturer/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address above, then click "Forgot password".')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setResetSent(true)
    } catch (err: any) {
      setError(err?.message || 'Could not send reset email.')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo credentials (only visible in development)
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Top nav */}
      <nav
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="container flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label="ClearGuide home"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-hidden="true"
            >
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
              Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                color: 'var(--color-primary)',
                borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
              }}
            >
              <Building2 className="w-3 h-3" aria-hidden="true" />
              Manufacturer Portal
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Sign in to manage your manuals, team, and analytics.
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl border p-8 shadow-sm"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            {resetSent ? (
              <div
                className="text-center py-4 px-2 rounded-xl border"
                style={{
                  backgroundColor: 'var(--color-primary-subtle)',
                  borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                  Reset email sent!
                </p>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                  Check your inbox at <strong>{email}</strong> for a password reset link.
                </p>
                <button
                  type="button"
                  onClick={() => setResetSent(false)}
                  className="mt-3 text-xs font-medium hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate aria-label="Manufacturer sign in form">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mfg-signin-email" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                    Work email
                  </label>
                  <input
                    id="mfg-signin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@yourcompany.com"
                    required
                    aria-required="true"
                    aria-describedby={error ? 'mfg-login-error' : undefined}
                    className="auth-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="mfg-signin-password" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="mfg-signin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="auth-input pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ color: 'var(--color-muted-foreground)' }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    id="mfg-login-error"
                    role="alert"
                    aria-live="polite"
                    className="text-sm px-4 py-3 rounded-lg border"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                      color: 'var(--color-destructive)',
                      borderColor: 'color-mix(in srgb, var(--color-destructive) 25%, transparent)',
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  id="mfg-sign-in-submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
                  Sign in to portal
                </button>

                <p className="text-sm text-center" style={{ color: 'var(--color-muted-foreground)' }}>
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/manufacturer/sign-up"
                    className="font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Register your company
                  </Link>
                </p>
              </form>
            )}

            {/* Dev demo credentials */}
            {isDev && (
              <>
                <div className="flex items-center gap-3 mt-5">
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Dev only</span>
                  <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
                </div>
                <div
                  className="rounded-xl border p-4 mt-3 space-y-2"
                  style={{
                    backgroundColor: 'var(--color-primary-subtle)',
                    borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Demo credentials</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Email</span>
                      <button
                        type="button"
                        onClick={() => setEmail('demo@brewtech.com')}
                        className="text-xs font-mono font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        demo@brewtech.com
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Password</span>
                      <button
                        type="button"
                        onClick={() => setPassword('password123')}
                        className="text-xs font-mono font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        password123
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User account link */}
          <p className="text-xs text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Looking for a user account?{' '}
            <Link href="/user/sign-in" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
              Sign in as a user
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function ManufacturerSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      }
    >
      <ManufacturerSignInContent />
    </Suspense>
  )
}
