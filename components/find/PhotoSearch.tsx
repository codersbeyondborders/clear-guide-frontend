'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, Upload, Loader2, AlertCircle, X, CheckCircle2,
  MessageCircle, Star, ChevronRight, ExternalLink, Lightbulb, ScanSearch, Info,
} from 'lucide-react'

const MAX_BYTES = 8 * 1024 * 1024

interface ManualMatch {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  description: string | null
  coverImage: string | null
}
interface CommunityThread {
  id: string; manualId: string; title: string; body: string
  isSolved: boolean; replyCount: number; manualName: string | null
}
interface CommunityReview {
  id: string; manualId: string; rating: number; title: string | null
  body: string; manualName: string | null
}
interface WebLink { id: string; label: string; description: string; url: string }

interface IdentifyResponse {
  validated: boolean
  unavailable?: boolean
  specs: { brand: string | null; model: string | null; productType: string | null; keywords: string | null }
  description: string
  manuals?: ManualMatch[]
  tips?: string[]
  community?: { threads: CommunityThread[]; reviews: CommunityReview[] }
  webLinks?: WebLink[]
}

type Phase = 'idle' | 'uploading' | 'identifying' | 'done' | 'error'

export function PhotoSearch() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<IdentifyResponse | null>(null)

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setPhase('idle')
    setError(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFile = async (file: File) => {
    setError(null)
    setResult(null)

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      setPhase('error')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image is too large (max 8MB).')
      setPhase('error')
      return
    }

    setPreview(URL.createObjectURL(file))

    try {
      // 1. Upload to private Blob.
      setPhase('uploading')
      const form = new FormData()
      form.append('file', file)
      const upRes = await fetch('/api/find/upload', { method: 'POST', body: form })
      if (!upRes.ok) {
        const d = (await upRes.json()) as { error?: string }
        throw new Error(d.error ?? 'Upload failed.')
      }
      const { url, contentType } = (await upRes.json()) as { url: string; contentType: string }

      // 2. Identify.
      setPhase('identifying')
      const idRes = await fetch('/api/find/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, contentType }),
      })
      if (!idRes.ok) {
        const d = (await idRes.json()) as { error?: string }
        throw new Error(d.error ?? 'Identification failed.')
      }
      const data = (await idRes.json()) as IdentifyResponse
      setResult(data)
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setPhase('error')
    }
  }

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  const busy = phase === 'uploading' || phase === 'identifying'
  const specText = result
    ? [result.specs.brand, result.specs.model, result.specs.productType].filter(Boolean).join(' · ')
    : ''

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          aria-hidden="true"
        >
          <ScanSearch className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2 className="text-base font-bold text-foreground">Identify with a photo</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Take a photo of your device or upload one. We&apos;ll try to find it in our system or point you to help.
        </p>
      </div>

      {/* Hidden inputs: capture (camera) + upload (library) */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onInput} className="sr-only" aria-hidden="true" tabIndex={-1} />

      {/* Preview / dropzone */}
      {preview ? (
        <div className="relative w-full max-w-xs mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected device" className="w-full rounded-2xl border object-cover" style={{ borderColor: 'var(--color-border)' }} />
          {!busy && (
            <button
              onClick={reset}
              className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
              aria-label="Remove photo"
            >
              <X className="w-4 h-4 text-foreground" aria-hidden="true" />
            </button>
          )}
          {busy && (
            <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 bg-black/40">
              <Loader2 className="w-6 h-6 animate-spin text-white" aria-hidden="true" />
              <p className="text-xs font-medium text-white">
                {phase === 'uploading' ? 'Uploading photo…' : 'Identifying device…'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
          <button
            onClick={() => { if (fileRef.current) { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click() } }}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          >
            <Camera className="w-6 h-6" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground">Take photo</span>
          </button>
          <button
            onClick={() => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click() } }}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
          >
            <Upload className="w-6 h-6" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <span className="text-xs font-semibold text-foreground">Upload image</span>
          </button>
        </div>
      )}

      {/* Live status for screen readers */}
      <p className="sr-only" role="status" aria-live="polite">
        {busy
          ? (phase === 'uploading' ? 'Uploading photo.' : 'Identifying device.')
          : phase === 'done'
            ? (result?.validated ? 'Product found in our system.' : 'No exact match. Showing open-source results.')
            : ''}
      </p>

      {/* Error */}
      {phase === 'error' && error && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl border max-w-xs mx-auto"
          style={{ borderColor: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)' }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive text-pretty">{error}</p>
        </div>
      )}

      {/* Results */}
      {phase === 'done' && result && (
        <div className="space-y-4">
          {/* What we saw */}
          <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">What we detected</p>
            <p className="text-sm text-foreground text-pretty">{result.description}</p>
            {specText && <p className="mt-1 text-xs text-muted-foreground">{specText}</p>}
          </div>

          {/* VALIDATED */}
          {result.validated && result.manuals && result.manuals.length > 0 && (
            <section aria-labelledby="validated-label">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <p id="validated-label" className="text-sm font-bold text-foreground">We found your product</p>
              </div>
              <ul className="space-y-2" role="list">
                {result.manuals.map(m => (
                  <li key={m.id}>
                    <button
                      onClick={() => router.push(`/manual/${m.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      style={{ borderColor: 'var(--color-primary)', backgroundColor: 'var(--color-card)' }}
                      aria-label={`Open manual for ${m.productName}`}
                    >
                      {m.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.coverImage} alt="" aria-hidden="true" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-subtle)' }} aria-hidden="true">
                          <span className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>{m.productName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{m.productName}</p>
                        <p className="text-xs truncate text-muted-foreground">{[m.brand, m.productModel].filter(Boolean).join(' · ')}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* OPEN-SOURCE */}
          {!result.validated && (
            <div className="space-y-4">
              {result.unavailable ? (
                <div
                  className="flex items-start gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}
                  role="status"
                  aria-live="polite"
                >
                  <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  <p className="text-sm text-foreground text-pretty">
                    Automatic photo identification is temporarily unavailable. In the meantime, you can browse
                    community discussions or search the web for help below.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-pretty">
                  We don&apos;t have this exact product in our system yet. Here&apos;s what the community and the web can offer.
                </p>
              )}

              {/* AI tips */}
              {result.tips && result.tips.length > 0 && (
                <section aria-labelledby="tips-label">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    <p id="tips-label" className="text-sm font-bold text-foreground">Troubleshooting tips</p>
                  </div>
                  <ul className="space-y-1.5" role="list">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} aria-hidden="true" />
                        <span className="text-pretty">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Community threads */}
              {result.community && result.community.threads.length > 0 && (
                <section aria-labelledby="comm-threads-label">
                  <p id="comm-threads-label" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Community discussions
                  </p>
                  <ul className="space-y-2" role="list">
                    {result.community.threads.map(t => (
                      <li key={t.id}>
                        <button
                          onClick={() => router.push(`/manual/${t.manualId}/forum/${t.id}`)}
                          className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                          aria-label={`Open discussion: ${t.title}`}
                        >
                          <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground text-pretty">{t.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t.isSolved ? 'Solved · ' : ''}{t.replyCount} replies{t.manualName ? ` · ${t.manualName}` : ''}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Community reviews */}
              {result.community && result.community.reviews.length > 0 && (
                <section aria-labelledby="comm-reviews-label">
                  <p id="comm-reviews-label" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Related reviews
                  </p>
                  <ul className="space-y-2" role="list">
                    {result.community.reviews.map(r => (
                      <li key={r.id}>
                        <button
                          onClick={() => router.push(`/manual/${r.manualId}`)}
                          className="w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                          aria-label={`Open review${r.title ? `: ${r.title}` : ''}`}
                        >
                          <Star className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }} aria-hidden="true" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground text-pretty">{r.title ?? `${r.rating}-star review`}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 text-pretty">{r.body}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Web deep-links */}
              {result.webLinks && result.webLinks.length > 0 && (
                <section aria-labelledby="web-links-label">
                  <p id="web-links-label" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Search the web
                  </p>
                  <ul className="space-y-2" role="list">
                    {result.webLinks.map(link => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{link.label}</p>
                            <p className="text-xs text-muted-foreground text-pretty">{link.description}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          <button
            onClick={reset}
            className="w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Try another photo
          </button>
        </div>
      )}
    </div>
  )
}
