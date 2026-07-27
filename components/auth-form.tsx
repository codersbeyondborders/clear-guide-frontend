'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'

interface AuthFormProps {
  mode: 'sign-in' | 'sign-up'
  redirectTo?: string
  userType?: 'manufacturer' | 'end_user'
}

export function AuthForm({ mode, redirectTo = '/manufacturer/dashboard', userType = 'manufacturer' }: AuthFormProps) {
  const router = useRouter()
  const isSignUp = mode === 'sign-up'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        if (name) {
          await updateProfile(userCredential.user, { displayName: name })
        }
        setSuccess('Account created successfully! Signing you in...')
        setTimeout(() => {
          router.push(redirectTo)
          router.refresh()
        }, 1500)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5" aria-label={isSignUp ? 'Create account form' : 'Sign in form'}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading ? (isSignUp ? 'Creating your account...' : 'Signing you in...') : ''}
      </div>

      {isSignUp && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="auth-input"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="auth-input"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignUp ? 'Min. 6 characters' : '••••••••'}
            className="auth-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {success && (
        <p role="status" aria-live="polite" className="text-sm text-success bg-success/10 border border-success/20 rounded-md px-3 py-2">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading || !!success}
        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {isSignUp ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-sm text-center text-muted-foreground">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <a
          href={
            userType === 'end_user'
              ? isSignUp ? '/user/sign-in' : '/user/sign-up'
              : isSignUp ? '/sign-in' : '/sign-up'
          }
          className="text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </a>
      </p>
    </form>
  )
}
