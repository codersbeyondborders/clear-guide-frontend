'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { Loader2, AlertCircle, ImageOff } from 'lucide-react'
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext'
import { ViewerHeader } from '@/components/ViewerHeader'
import { ViewerTabBar } from '@/components/ViewerTabBar'
import Image from 'next/image'
import { useAnalyticsTimeTracker } from '@/hooks/useAnalyticsTimeTracker'
import { X, ZoomIn } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Section {
  id: string
  sectionNumber: number
  title: string
  content: string
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
function InfographicContent({ manual }: { manual: Manual }) {
  const params   = useParams()
  const manualId = params.id as string
  const [selectedLang, setSelectedLang] = useState(manual.languages[0] ?? 'en')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const { fontSizeClass, highContrast } = useAccessibility()

  useAnalyticsTimeTracker(manualId, 'infographic')

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

      <main id="main-content" className="flex-1 p-4 lg:p-8">
        {/* Page title */}
        <div className="mb-6 max-w-4xl">
          <span
            className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
          >
            Visual Overview
          </span>
          <h1
            className={`text-2xl font-bold text-balance ${fontSizeClass}`}
            style={{ color: highContrast ? '#fff' : 'var(--color-foreground)' }}
          >
            {manual.productName}
          </h1>
          <p className="text-sm mt-1" style={{ color: highContrast ? '#aaa' : 'var(--color-muted-foreground)' }}>
            {manual.sections.length} section{manual.sections.length !== 1 ? 's' : ''} — tap any card to expand details
          </p>
        </div>

        {/* Masonry-like section grid */}
        {manual.sections.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          >
            <ImageOff className="w-8 h-8" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
            <p style={{ color: 'var(--color-muted-foreground)' }}>No sections available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {manual.sections.map(section => {
              const isExpanded = expanded === section.id
              const hasImage   = section.imageUrls.length > 0

              return (
                <article
                  key={section.id}
                  className="rounded-2xl border overflow-hidden flex flex-col"
                  style={{
                    borderColor: highContrast ? '#555' : 'var(--color-border)',
                    backgroundColor: highContrast ? '#111' : 'var(--color-card)',
                  }}
                >
                  {/* Image or placeholder */}
                  <div
                    className="relative w-full"
                    style={{
                      aspectRatio: '16/9',
                      backgroundColor: highContrast ? '#222' : 'var(--color-background-subtle)',
                    }}
                  >
                    {hasImage ? (
                      <div 
                        className="w-full h-full cursor-zoom-in group"
                        onClick={() => setLightboxImage(section.imageUrls[0])}
                      >
                        <Image
                          src={section.imageUrls[0]}
                          alt={`${section.title} illustration`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                        >
                          <span
                            className="text-2xl font-black"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {section.sectionNumber}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Section number badge */}
                    <div
                      className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-primary-foreground)',
                      }}
                      aria-hidden="true"
                    >
                      {section.sectionNumber}
                    </div>
                  </div>

                  {/* Text body */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2
                        className={`font-bold leading-snug flex-1 ${fontSizeClass}`}
                        style={{ color: highContrast ? '#fff' : 'var(--color-foreground)' }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    {section.content ? (
                      <div id={`section-content-${section.id}`}>
                        <p
                          className={`text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}
                          style={{ color: highContrast ? '#ccc' : 'var(--color-muted-foreground)' }}
                        >
                          {section.content}
                        </p>
                        {section.content.length > 150 && (
                          <button
                            onClick={() => setExpanded(isExpanded ? null : section.id)}
                            className="mt-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            style={{ color: 'var(--color-primary)' }}
                            aria-expanded={isExpanded}
                            aria-controls={`section-content-${section.id}`}
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p
                        className="text-xs italic"
                        style={{ color: highContrast ? '#666' : 'var(--color-muted-foreground)' }}
                      >
                        No description available.
                      </p>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <ViewerTabBar manualId={manualId} activeMode="infographic" />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-5xl aspect-square md:aspect-[16/9]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxImage}
              alt="Zoomed infographic"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
export default function InfographicModePage() {
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
      <InfographicContent manual={manual} />
    </AccessibilityProvider>
  )
}
