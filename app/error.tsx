'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[ClearGuide] Unhandled error:', error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-sm font-semibold text-destructive uppercase tracking-widest mb-4">500</p>
      <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">
        Something went wrong
      </h1>
      <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
        An unexpected error occurred. Our team has been notified. Please try again or return home.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mb-6 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Go to homepage
        </Link>
      </div>
    </main>
  )
}
