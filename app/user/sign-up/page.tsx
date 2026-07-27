import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, UserRound } from 'lucide-react'
import { EndUserSignUpForm } from '@/components/EndUserSignUpForm'

export const metadata: Metadata = {
  title: 'Create Account — ClearGuide',
  description:
    'Create your free ClearGuide account to find accessible product guides, join the community, and personalise your reading experience.',
}

export default function UserSignUpPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo + badge */}
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

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-3"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
              color: 'var(--color-primary)',
              borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
            }}
          >
            <UserRound className="w-3 h-3" aria-hidden="true" />
            User account — free
          </div>

          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            Create your account
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Find guides, get AI support, personalise your experience
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <EndUserSignUpForm redirectTo="/user" />
        </div>

        {/* Manufacturer link */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-muted-foreground)' }}>
          Are you a manufacturer?{' '}
          <Link
            href="/manufacturer/sign-up"
            className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-primary)' }}
          >
            Register your company
          </Link>
        </p>
      </div>
    </main>
  )
}
