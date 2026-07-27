'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Loader2, AlertCircle, Volume2, ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'
import { useTTS } from '@/hooks/useTTS'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Section {
  id: string
  sectionNumber: number
  title: string
  content: string
  imageUrls: string[]
  videoUrls: string[]
}

interface Manual {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  serialNumber: string | null
  description: string | null
  status: string
  languages: string[]
  sections: Section[]
}

// ---------------------------------------------------------------------------
// Fetcher (public endpoint)
// ---------------------------------------------------------------------------
const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json() as Promise<Manual>
  })

// ---------------------------------------------------------------------------
// Inner content (wrapped in AccessibilityProvider)
// ---------------------------------------------------------------------------
function TextModeContent({ manual }: { manual: Manual }) {
  const params   = useParams()
  const manualId = params.id as string

  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')
  const [muted, setMuted] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  const { fontSizeClass, highContrast } = useAccessibility()
  const { speak, ttsEnabled } = useTTS()

  const section = manual.sections[activeIndex]
  const total   = manual.sections.length

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(idx, total - 1))
      setActiveIndex(clamped)
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [total],
  )

  // Keyboard navigation: arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(activeIndex + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(activeIndex - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, goTo])

  // TTS: auto-read when section changes
  useEffect(() => {
    if (section && ttsEnabled && !muted) {
      speak(`${section.title}. ${section.content ?? ''}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id, ttsEnabled, muted])

  // Build plain-text blob for download in the header
  const plainText = manual.sections
    .map(s => `${s.sectionNumber}. ${s.title}\n\n${s.content ?? ''}`)
    .join('\n\n---\n\n')

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
          sectionCount: total,
        }}
        manualId={manualId}
        selectedLang={selectedLang}
        onLangChange={setSelectedLang}
        plainText={plainText}
        showMute={ttsEnabled}
        muted={muted}
        onToggleMute={() => setMuted(m => !m)}
      />

      {/* Two-panel layout */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (desktop) */}
        <aside
          className="hidden lg:flex flex-col w-64 shrink-0 border-r overflow-y-auto"
          style={{
            borderColor: highContrast ? '#555' : 'var(--color-border)',
            backgroundColor: highContrast ? '#111' : 'var(--color-card)',
          }}
          aria-label="Manual sections"
        >
          {/* Sidebar header with progress */}
          <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: highContrast ? '#444' : 'var(--color-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: highContrast ? '#aaa' : 'var(--color-muted-foreground)' }}>
              Sections
            </p>
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: highContrast ? '#333' : 'var(--color-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${((activeIndex + 1) / total) * 100}%`,
                    backgroundColor: 'var(--color-primary)',
                  }}
                  role="progressbar"
                  aria-valuenow={activeIndex + 1}
                  aria-valuemin={1}
                  aria-valuemax={total}
                  aria-label={`Section ${activeIndex + 1} of ${total}`}
                />
              </div>
              <span className="text-xs tabular-nums shrink-0" style={{ color: highContrast ? '#aaa' : 'var(--color-muted-foreground)' }}>
                {activeIndex + 1}/{total}
              </span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul role="list">
              {manual.sections.map((s, idx) => {
                const isActive = idx === activeIndex
                const isDone   = idx < activeIndex
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => goTo(idx)}
                      className="w-full text-left px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring flex items-start gap-2.5"
                      style={{
                        backgroundColor: isActive
                          ? highContrast ? '#333' : 'var(--color-primary-subtle)'
                          : 'transparent',
                        borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                        color: isActive
                          ? highContrast ? '#fff' : 'var(--color-primary)'
                          : highContrast ? '#ccc' : 'var(--color-foreground)',
                        fontWeight: isActive ? 600 : 400,
                        opacity: isDone ? 0.6 : 1,
                      }}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span
                        className="text-xs font-bold shrink-0 mt-0.5 w-5 text-right"
                        style={{ color: isActive ? 'var(--color-primary)' : highContrast ? '#888' : 'var(--color-muted-foreground)' }}
                        aria-hidden="true"
                      >
                        {s.sectionNumber}.
                      </span>
                      <span className="flex-1 text-pretty leading-snug">{s.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Content area */}
        <main
          id="main-content"
          ref={contentRef}
          className="flex-1 overflow-y-auto p-5 lg:p-8"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Mobile: section dropdown */}
          <div className="lg:hidden mb-4">
            <label htmlFor="section-select" className="sr-only">Choose section</label>
            <select
              id="section-select"
              value={activeIndex}
              onChange={e => goTo(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card)',
                color: 'var(--color-foreground)',
              }}
            >
              {manual.sections.map((s, idx) => (
                <option key={s.id} value={idx}>
                  {s.sectionNumber}. {s.title}
                </option>
              ))}
            </select>
          </div>

          {section ? (
            <article className="max-w-2xl">
              {/* Section heading */}
              <div className="flex items-start gap-3 mb-6">
                <div className="flex-1 min-w-0">
                  {/* Step badge */}
                  <span
                    className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  >
                    Section {section.sectionNumber} of {total}
                  </span>
                  <h1
                    className="text-2xl font-bold text-balance"
                    style={{ color: highContrast ? '#fff' : 'var(--color-foreground)' }}
                  >
                    {section.title}
                  </h1>
                </div>
                {ttsEnabled && (
                  <button
                    onClick={() => speak(`${section.title}. ${section.content ?? ''}`)}
                    className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
                    aria-label="Read section aloud"
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Primary image */}
              {section.imageUrls.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={section.imageUrls[0]}
                  alt={`${section.title} illustration`}
                  className="w-full rounded-xl object-cover mb-6"
                  style={{ maxHeight: '320px' }}
                />
              )}

              {/* Section text */}
              <div
                className={`leading-relaxed whitespace-pre-line ${fontSizeClass}`}
                style={{ color: highContrast ? '#eee' : 'var(--color-foreground)' }}
              >
                {section.content || (
                  <span
                    style={{
                      color: highContrast ? '#888' : 'var(--color-muted-foreground)',
                      fontStyle: 'italic',
                    }}
                  >
                    No content for this section.
                  </span>
                )}
              </div>

              {/* Additional images */}
              {section.imageUrls.length > 1 && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {section.imageUrls.slice(1).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`${section.title} image ${i + 2}`}
                      className="w-full rounded-xl object-cover aspect-video"
                    />
                  ))}
                </div>
              )}

              {/* Prev / Next */}
              <nav
                className="flex items-center justify-between mt-10 pt-6 border-t"
                style={{ borderColor: highContrast ? '#444' : 'var(--color-border)' }}
                aria-label="Section navigation"
              >
                <button
                  onClick={() => goTo(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  Previous
                </button>
                <span
                  className="text-xs"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {activeIndex + 1} / {total}
                </span>
                <button
                  onClick={() => goTo(activeIndex + 1)}
                  disabled={activeIndex === total - 1}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </nav>
            </article>
          ) : (
            <p style={{ color: 'var(--color-muted-foreground)' }}>No sections available.</p>
          )}
        </main>
      </div>

      <ViewerTabBar manualId={manualId} activeMode="text" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page shell (SWR + AccessibilityProvider)
// ---------------------------------------------------------------------------
export default function TextModePage() {
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
      <TextModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
