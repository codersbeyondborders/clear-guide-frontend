import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen,
  Building2,
  UserRound,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Get Started — ClearGuide',
  description:
    'Choose how you want to use ClearGuide — find accessible product guides as a user, or create and publish manuals as a manufacturer.',
}

const USER_BENEFITS = [
  'Find accessible manuals for any product',
  'AI chat support for troubleshooting',
  'High-contrast & large-text modes',
  'Personalised accessibility preferences',
  'Free — no subscription needed',
]

const MFG_BENEFITS = [
  'Publish AI-powered product manuals',
  'Multi-language support out of the box',
  'Analytics & engagement insights',
  'QR code & AR viewer integrations',
  'Team collaboration with role-based access',
]

export default function GetStartedPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label="ClearGuide home"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-hidden="true"
        >
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
        </span>
      </Link>

      {/* Heading */}
      <div className="text-center mb-10 max-w-md">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
          How will you use ClearGuide?
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Choose your account type to get started. You can always switch later.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
        {/* End User card */}
        <div
          className="rounded-2xl border p-7 flex flex-col gap-5 shadow-sm"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
              aria-hidden="true"
            >
              <UserRound className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p className="font-bold text-lg leading-snug" style={{ color: 'var(--color-foreground)' }}>
                I&apos;m a User
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Consumer / end user
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-2" aria-label="User account benefits">
            {USER_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-foreground)' }}>
                <CheckCircle2
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 mt-auto pt-2">
            <Link
              href="/user/sign-up"
              className="btn-primary text-sm text-center flex items-center justify-center gap-2"
            >
              Create free account
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/user/sign-in"
              className="btn-ghost text-sm text-center"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        {/* Manufacturer card */}
        <div
          className="rounded-2xl border p-7 flex flex-col gap-5 shadow-sm relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {/* "For businesses" badge */}
          <div
            className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
              borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
          >
            For businesses
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
              aria-hidden="true"
            >
              <Building2 className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p className="font-bold text-lg leading-snug" style={{ color: 'var(--color-foreground)' }}>
                I&apos;m a Manufacturer
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Brand / product company
              </p>
            </div>
          </div>

          <ul className="flex flex-col gap-2" aria-label="Manufacturer account benefits">
            {MFG_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-foreground)' }}>
                <CheckCircle2
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 mt-auto pt-2">
            <Link
              href="/manufacturer/sign-up"
              className="btn-primary text-sm text-center flex items-center justify-center gap-2"
            >
              Start publishing free
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/manufacturer/sign-in"
              className="btn-ghost text-sm text-center"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Already have a company account? Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-center mt-8" style={{ color: 'var(--color-muted-foreground)' }}>
        Not sure?{' '}
        <Link
          href="/"
          className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          style={{ color: 'var(--color-primary)' }}
        >
          Learn more about ClearGuide
        </Link>
      </p>
    </main>
  )
}
