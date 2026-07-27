import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { FindClient } from '@/components/find/FindClient'

export const metadata = {
  title: 'Find your product — ClearGuide',
  description: 'Scan a QR code, enter product specs, or use a photo to find the right manual and support.',
}

function FindFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

export default function FindPage() {
  return (
    <Suspense fallback={<FindFallback />}>
      <FindClient />
    </Suspense>
  )
}
