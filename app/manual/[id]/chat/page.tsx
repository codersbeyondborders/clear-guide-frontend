'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Loader2, AlertCircle } from 'lucide-react'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'
import { AIChatSupport } from '@/components/viewer/AIChatSupport'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Section {
  id: string
  sectionNumber: number
  title: string
}

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  serialNumber: string | null
  description: string | null
  languages: string[]
  sections: Section[]
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------
const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json() as Promise<Manual>
  })

// ---------------------------------------------------------------------------
// Inner content
// ---------------------------------------------------------------------------
function ChatModeContent({ manual }: { manual: Manual }) {
  const params   = useParams()
  const manualId = params.id as string
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')
  const [activeSection, setActiveSection] = useState(0)

  const { highContrast } = useAccessibility()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: highContrast ? '#000' : 'var(--color-background)',
        color: highContrast ? '#fff' : 'var(--color-foreground)',
      }}
    >
      <ViewerHeader
        manualInfo={{
          productName: manual.productName,
          productModel: manual.productModel,
          brand: manual.brand,
          serialNumber: manual.serialNumber,
          languages: manual.languages,
          sectionCount: manual.sections.length,
        }}
        manualId={manualId}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
      />

      {/* Two-panel: sections sidebar + chat */}
      <div className="flex flex-1 min-h-0" style={{ minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-56 shrink-0 border-r overflow-y-auto"
          style={{
            borderColor: highContrast ? '#555' : 'var(--color-border)',
            backgroundColor: highContrast ? '#111' : 'var(--color-card)',
          }}
          aria-label="Manual sections"
        >
          <p
            className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: highContrast ? '#aaa' : 'var(--color-muted-foreground)' }}
          >
            Sections
          </p>
          <nav>
            <ul role="list">
              {manual.sections.map((s, idx) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveSection(idx)}
                    className="w-full text-left px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    style={{
                      backgroundColor:
                        idx === activeSection
                          ? highContrast ? '#333' : 'var(--color-primary-subtle)'
                          : 'transparent',
                      color:
                        idx === activeSection
                          ? highContrast ? '#fff' : 'var(--color-primary)'
                          : highContrast ? '#ccc' : 'var(--color-foreground)',
                      fontWeight: idx === activeSection ? 600 : 400,
                    }}
                    aria-current={idx === activeSection ? 'true' : undefined}
                  >
                    <span className="text-xs font-bold mr-2 opacity-50">{s.sectionNumber}.</span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Chat panel — fill remaining height */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 p-4 lg:p-5">
          <AIChatSupport
            manualId={manualId}
            highContrast={highContrast}
          />
        </div>
      </div>

      <ViewerTabBar manualId={manualId} activeMode="chat" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
export default function ChatModePage() {
  const params   = useParams()
  const manualId = params.id as string

  const { data: manual, error, isLoading } = useSWR<Manual>(
    manualId ? `/api/public/manuals/${manualId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
        role="status"
        aria-label="Loading"
      >
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    )
  }

  if (error || !manual) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-8"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-destructive)' }} aria-hidden="true" />
        <p style={{ color: 'var(--color-destructive)' }}>Could not load manual.</p>
      </div>
    )
  }

  return (
    <AccessibilityProvider initialLanguage={manual.languages?.[0] ?? 'en'}>
      <ChatModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
