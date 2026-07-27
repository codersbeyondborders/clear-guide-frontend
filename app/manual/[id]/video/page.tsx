'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import { Loader2, AlertCircle, Volume2, ChevronLeft, ChevronRight } from 'lucide-react'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'

// ---------------------------------------------------------------------------
// Lazy VideoPlayer (SSR off)
// ---------------------------------------------------------------------------
const VideoPlayer = dynamic(
  () => import('@/components/VideoPlayer').then(m => m.VideoPlayer),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-xl border animate-pulse"
        style={{
          aspectRatio: '16/9',
          backgroundColor: 'var(--color-background-subtle)',
          borderColor: 'var(--color-border)',
        }}
        aria-hidden="true"
      />
    ),
  },
)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Section {
  id: string
  sectionNumber: number
  title: string
  content: string
  videoUrls: string[]
  imageUrls: string[]
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
function VideoModeContent({ manual }: { manual: Manual }) {
  const params   = useParams()
  const manualId = params.id as string
  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')

  const { fontSizeClass, highContrast } = useAccessibility()

  const section = manual.sections[activeIndex]
  const total   = manual.sections.length

  const goTo = (idx: number) =>
    setActiveIndex(Math.max(0, Math.min(idx, total - 1)))

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
      />

      {/* Two-panel layout — sidebar on desktop */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside
          className="hidden lg:flex flex-col w-64 shrink-0 border-r overflow-y-auto"
          style={{
            borderColor: highContrast ? '#555' : 'var(--color-border)',
            backgroundColor: highContrast ? '#111' : 'var(--color-card)',
          }}
          aria-label="Video sections"
        >
          <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: highContrast ? '#444' : 'var(--color-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: highContrast ? '#aaa' : 'var(--color-muted-foreground)' }}>
              Sections
            </p>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul role="list">
              {manual.sections.map((s, idx) => {
                const isActive = idx === activeIndex
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

      <main id="main-content" className="flex-1 p-4 lg:p-6 space-y-5 overflow-y-auto">
        {section ? (
          <>
            {/* Active section heading */}
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <span
                  className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5"
                  style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  Section {activeIndex + 1} of {total}
                </span>
                <h1
                  className={`text-xl font-bold text-balance ${fontSizeClass}`}
                  style={{ color: highContrast ? '#fff' : 'var(--color-foreground)' }}
                >
                  {section.title}
                </h1>
              </div>
            </div>

            {/* Video player */}
            <VideoPlayer src={section.videoUrls[0]} title={section.title} />

            {/* Audio description / caption */}
            {section.content && (
              <div
                className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: highContrast
                    ? '#1a2a1a'
                    : 'var(--color-primary-subtle)',
                }}
              >
                <Volume2
                  className="w-4 h-4 mt-0.5 shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
                <p
                  className={`text-sm leading-relaxed ${fontSizeClass}`}
                  style={{ color: highContrast ? '#9f9' : 'var(--color-primary)' }}
                >
                  {section.content}
                </p>
              </div>
            )}

            {/* Prev / Next nav */}
            <nav
              className="flex items-center justify-between pt-2"
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

            {/* Section carousel thumbnails */}
            <section aria-labelledby="carousel-label">
              <p
                id="carousel-label"
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: highContrast ? '#aaa' : 'var(--color-muted-foreground)' }}
              >
                All sections
              </p>
              <div
                className="flex gap-3 overflow-x-auto pb-2"
                role="list"
                aria-label="Section thumbnails"
              >
                {manual.sections.map((s, idx) => {
                  const thumb    = s.imageUrls[0] ?? null
                  const isActive = idx === activeIndex
                  return (
                    <div
                      key={s.id}
                      role="listitem"
                    >
                      <button
                        onClick={() => goTo(idx)}
                        className="shrink-0 w-32 rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{
                          borderColor: isActive ? 'var(--color-primary)' : highContrast ? '#555' : 'var(--color-border)',
                        }}
                        aria-label={`Go to section: ${s.title}`}
                        aria-pressed={isActive}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative w-full aspect-video"
                          style={{ backgroundColor: highContrast ? '#222' : 'var(--color-background-subtle)' }}
                        >
                          {thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={thumb}
                              alt=""
                              aria-hidden="true"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                              <span
                                className="text-lg font-black"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                {s.sectionNumber}
                              </span>
                            </div>
                          )}
                          {/* Play overlay */}
                          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{
                                backgroundColor: isActive
                                  ? 'var(--color-primary)'
                                  : 'rgba(0,0,0,0.45)',
                              }}
                            >
                              <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                                <polygon points="0,0 10,6 0,12" fill="white" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        {/* Label */}
                        <div
                          className="px-2 py-1.5"
                          style={{
                            backgroundColor: isActive ? 'var(--color-primary)' : highContrast ? '#222' : 'var(--color-card)',
                          }}
                        >
                          <p
                            className="text-xs font-medium truncate"
                            style={{ color: isActive ? 'white' : highContrast ? '#ccc' : 'var(--color-foreground)' }}
                          >
                            {s.title}
                          </p>
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          </>
        ) : (
          <p style={{ color: 'var(--color-muted-foreground)' }}>No sections available.</p>
        )}
      </main>
      </div>{/* end flex-1 panel layout */}

      <ViewerTabBar manualId={manualId} activeMode="video" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
export default function VideoModePage() {
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
      <VideoModeContent manual={manual} />
    </AccessibilityProvider>
  )
}
