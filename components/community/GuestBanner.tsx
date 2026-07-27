import { Lock } from 'lucide-react'

interface GuestBannerProps {
  message?: string
  returnTo?: string
}

export function GuestBanner({
  message = 'Sign up to join the discussion and write reviews.',
  returnTo,
}: GuestBannerProps) {
  const signUpHref = returnTo
    ? `/user/sign-up?returnTo=${encodeURIComponent(returnTo)}`
    : '/user/sign-up'
  const signInHref = returnTo
    ? `/user/sign-in?returnTo=${encodeURIComponent(returnTo)}`
    : '/user/sign-in'

  return (
    <div
      className="rounded-xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{
        backgroundColor: 'var(--color-primary-subtle)',
        borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)',
      }}
      role="note"
      aria-label="Guest access notice"
    >
      <Lock
        className="w-4 h-4 shrink-0 hidden sm:block"
        style={{ color: 'var(--color-primary)' }}
        aria-hidden="true"
      />
      <p className="text-sm flex-1" style={{ color: 'var(--color-foreground)' }}>
        {message}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={signUpHref}
          className="inline-flex items-center h-8 px-4 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-foreground)',
          }}
        >
          Sign up free
        </a>
        <a
          href={signInHref}
          className="inline-flex items-center h-8 px-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'transparent',
          }}
        >
          Sign in
        </a>
      </div>
    </div>
  )
}
