'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ClearGuide] Global Error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center font-sans">
        <div className="max-w-md mx-auto p-6 rounded-2xl border bg-card text-card-foreground shadow-xl">
          <p className="text-xs font-semibold text-destructive uppercase tracking-widest mb-2">500 - Application Error</p>
          <h1 className="text-2xl font-bold mb-3 text-foreground">
            Something went wrong!
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            An unexpected error occurred. Please try again or navigate back to safety.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted p-2 rounded">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Try again
            </button>
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-foreground hover:bg-muted transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
