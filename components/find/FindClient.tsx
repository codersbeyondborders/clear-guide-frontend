'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { QrCode, SlidersHorizontal, ScanSearch } from 'lucide-react'
import { QRScanner } from '@/components/find/QRScanner'
import { SpecSearch } from '@/components/find/SpecSearch'
import { PhotoSearch } from '@/components/find/PhotoSearch'
import { useEndUser } from '@/hooks/useEndUser'

type TabId = 'qr' | 'specs' | 'photo'

const TABS: { id: TabId; label: string; Icon: typeof QrCode }[] = [
  { id: 'qr',    label: 'Scan QR',     Icon: QrCode },
  { id: 'specs', label: 'Enter specs', Icon: SlidersHorizontal },
  { id: 'photo', label: 'Use photo',   Icon: ScanSearch },
]

function isTab(v: string | null): v is TabId {
  return v === 'qr' || v === 'specs' || v === 'photo'
}

export function FindClient() {
  const params = useSearchParams()
  const initial = params.get('tab')
  const { isAuthenticated } = useEndUser()

  const [active, setActive] = useState<TabId>(isTab(initial) ? initial : 'qr')

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <Link href="/" className="text-xl font-bold text-primary shrink-0" aria-label="ClearGuide home">
            ClearGuide
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/community"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
            >
              Products Forum
            </Link>
            {!isAuthenticated && (
              <Link
                href="/user/sign-in"
                className="inline-flex items-center h-8 px-3 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* Intro */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground text-balance">Find your product</h1>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">
              Scan a code, enter specs, or snap a photo to get the right manual and support.
            </p>
          </div>

          {/* Tabs */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }} role="tablist" aria-label="Finding methods">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={active === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActive(tab.id)}
                  className="flex-1 flex flex-col items-center gap-1 px-2 py-3 text-xs font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    borderBottomColor: active === tab.id ? 'var(--color-primary)' : 'transparent',
                    color: active === tab.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <tab.Icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {active === 'qr' && (
                <div id="panel-qr" role="tabpanel" aria-labelledby="tab-qr"><QRScanner /></div>
              )}
              {active === 'specs' && (
                <div id="panel-specs" role="tabpanel" aria-labelledby="tab-specs"><SpecSearch /></div>
              )}
              {active === 'photo' && (
                <div id="panel-photo" role="tabpanel" aria-labelledby="tab-photo"><PhotoSearch /></div>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground text-pretty">
            Finding is open to everyone. Sign in to post in forums and use AI Chat.
          </p>
        </div>
      </main>
    </div>
  )
}
