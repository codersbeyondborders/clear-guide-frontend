'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[ClearGuide] Page error:', error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      <div className="max-w-md w-full p-8 rounded-2xl border text-center shadow-lg"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--color-destructive)' }}>500</p>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-foreground)' }}>
          Something went wrong
        </h1>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
          An unexpected error occurred while rendering this page.
        </p>
        {error.digest && (
          <p className="text-xs mb-6 font-mono p-2 rounded border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-background-subtle)' }}>
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary text-xs px-5 py-2">
            Try again
          </button>
          <Link href="/" className="btn-outline text-xs px-5 py-2">
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}
