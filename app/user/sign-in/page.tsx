'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, BookOpen, UserRound } from 'lucide-react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { signInWithGoogle } from '@/lib/auth-helpers'

// ─── Google Button ────────────────────────────────────────────────────────────

function GoogleButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      id="google-sign-in"
      className="w-full flex items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      {loading ? 'Connecting…' : 'Continue with Google'}
    </button>
  )
}

function UserSignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/user'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithGoogle()
      router.push(returnTo)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push(returnTo)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label="ClearGuide home"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-hidden="true"
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
              Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
            </span>
          </Link>

          {/* User badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-3"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
              borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
          >
            <UserRound className="w-3 h-3" aria-hidden="true" />
            User account
          </div>

          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Sign in to access your guides and community
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6 shadow-sm flex flex-col gap-5"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {/* Google */}
          <GoogleButton onClick={handleGoogleSignIn} loading={isLoading} />

          {/* Or divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>or</span>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" aria-label="Sign in form">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-email" className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                Email address
              </label>
              <input
                id="user-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-password" className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input pr-10"
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
            </div>

            {error && (
              <p role="alert" aria-live="polite" className="text-sm rounded-lg px-3 py-2 border"
                style={{ color: 'var(--color-destructive)', borderColor: 'color-mix(in srgb, var(--color-destructive) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              id="user-sign-in-submit"
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}
              Sign in
            </button>
          </form>

          <p className="text-sm text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/user/sign-up" className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" style={{ color: 'var(--color-primary)' }}>
              Create one free
            </Link>
          </p>
        </div>

        {/* Manufacturer link */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-muted-foreground)' }}>
          Are you a manufacturer?{' '}
          <Link href="/manufacturer/sign-in" className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
            Sign in to the Manufacturer Portal
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function UserSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      }
    >
      <UserSignInContent />
    </Suspense>
  )
}
