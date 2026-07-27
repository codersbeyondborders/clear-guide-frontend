'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Building2, Loader2, Check, AlertTriangle, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type State = 'loading' | 'ready' | 'accepting' | 'success' | 'error'

interface InviteInfo {
  companyName: string
  role: string
  email: string
  expired: boolean
  alreadyAccepted: boolean
}

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [state, setState] = useState<State>('loading')
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Resolve invite details
  useEffect(() => {
    if (!token) return
    fetch(`/api/invitations/${token}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Invalid invitation.')
        setInvite(data)
        setState(data.expired || data.alreadyAccepted ? 'error' : 'ready')
        if (data.expired) setErrorMsg('This invitation has expired. Ask your team admin to send a new one.')
        if (data.alreadyAccepted) setErrorMsg('This invitation has already been accepted.')
      })
      .catch((err) => {
        setErrorMsg(err.message ?? 'Could not load invitation.')
        setState('error')
      })
  }, [token])

  async function handleAccept() {
    if (!user) {
      // Redirect to sign-in, come back here after
      router.push(`/sign-in?returnTo=/accept-invite/${token}`)
      return
    }
    setState('accepting')
    try {
      const res = await fetch(`/api/invitations/${token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Could not accept invitation.')
      setState('success')
      setTimeout(() => router.push('/manufacturer/dashboard'), 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setState('error')
    }
  }

  const isAuthLoading = authLoading || state === 'loading'

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" style={{ color: 'var(--color-primary)' }}>
            ClearGuide
          </a>
        </div>

        <div
          className="rounded-2xl border p-8 shadow-sm text-center space-y-6"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {/* Loading */}
          {isAuthLoading && (
            <>
              <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading invitation…</p>
            </>
          )}

          {/* Ready to accept */}
          {state === 'ready' && invite && (
            <>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
              >
                <Building2 className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
                  You&apos;ve been invited
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
                  Join <strong style={{ color: 'var(--color-foreground)' }}>{invite.companyName}</strong> on ClearGuide
                  as a <strong style={{ color: 'var(--color-foreground)' }} className="capitalize">{invite.role}</strong>.
                </p>
                {invite.email && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                    Invited to: <span style={{ color: 'var(--color-foreground)' }}>{invite.email}</span>
                  </p>
                )}
              </div>

              {!user ? (
                <div className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    Sign in to your ClearGuide account to accept this invitation.
                  </p>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    Sign in to accept
                  </button>
                  <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    Don&apos;t have an account?{' '}
                    <a href={`/sign-up?returnTo=/accept-invite/${token}`} className="underline" style={{ color: 'var(--color-primary)' }}>
                      Create one free
                    </a>
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAccept}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Accept invitation
                </button>
              )}
            </>
          )}

          {/* Accepting */}
          {state === 'accepting' && (
            <>
              <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Accepting invitation…</p>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
              >
                <Check className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>You&apos;re in!</h1>
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  Invitation accepted. Redirecting to your dashboard…
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)', color: 'var(--color-destructive)' }}
              >
                <AlertTriangle className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>Invitation unavailable</h1>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
                  {errorMsg || 'This invitation link is invalid or has expired.'}
                </p>
              </div>
              <a href="/manufacturer/dashboard" className="btn-ghost text-sm" style={{ color: 'var(--color-primary)' }}>
                Go to dashboard
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
