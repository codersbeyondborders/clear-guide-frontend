import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found — ClearGuide',
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">404</p>
      <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">
        Page not found
      </h1>
      <p className="text-muted-foreground max-w-sm leading-relaxed mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          Go to homepage
        </Link>
        <Link href="/user" className="btn-outline">
          Find a guide
        </Link>
      </div>
    </main>
  )
}
