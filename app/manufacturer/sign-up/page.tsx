import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Building2, ArrowLeft } from 'lucide-react'
import { ManufacturerSignUpForm } from '@/components/ManufacturerSignUpForm'

export const metadata: Metadata = {
  title: 'Register Your Company — ClearGuide',
  description:
    'Create your ClearGuide manufacturer account to publish accessible, AI-powered product manuals and track engagement analytics.',
}

export default function ManufacturerSignUpPage() {
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
            href="/get-started"
            className="flex items-center gap-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-12">
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
              Register your company
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Set up your account and start publishing accessible manuals in minutes.
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl border p-8 shadow-sm"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <ManufacturerSignUpForm redirectTo="/manufacturer/dashboard" />
          </div>

          {/* User link */}
          <p className="text-xs text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Looking for a user account?{' '}
            <Link
              href="/user/sign-up"
              className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              style={{ color: 'var(--color-primary)' }}
            >
              Create a free user account
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
