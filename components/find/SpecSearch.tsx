'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, AlertCircle, ChevronRight, SlidersHorizontal } from 'lucide-react'

interface SearchResult {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  serialNumber: string | null
  description: string | null
  coverImage: string | null
}

const DEMO_MAKES = ['BrewTech', 'AudioSync', 'TechHome', 'PowerTools Co.']

/**
 * Spec-based manual search. Reuses /api/public/manuals/search.
 * At least one of Brand or Model is required (keywords/serial optional).
 */
export function SpecSearch() {
  const router = useRouter()

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [serial, setSerial] = useState('')
  const [attempted, setAttempted] = useState(false)

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Need at least brand OR model to search meaningfully.
  const isValid = brand.trim().length > 0 || model.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    if (!isValid) return

    setLoading(true)
    setApiError(null)
    setResults(null)

    try {
      // The search API requires both brand & model; fill the missing one with
      // the other so a single-field search still returns useful matches.
      const b = brand.trim() || model.trim()
      const m = model.trim() || brand.trim()
      const params = new URLSearchParams({ brand: b, model: m })
      if (serial.trim()) params.set('serial', serial.trim())

      const res = await fetch(`/api/public/manuals/search?${params}`)
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Search failed.')
      }
      const data = (await res.json()) as { results: SearchResult[] }

      if (data.results.length === 1) {
        router.push(`/manual/${data.results[0].id}`)
        return
      }
      setResults(data.results)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Search failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full h-11 px-4 rounded-lg text-sm border border-border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          aria-hidden="true"
        >
          <SlidersHorizontal className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2 className="text-base font-bold text-foreground">Search by product specs</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Enter what you know — a brand or a model is enough to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Search for a product manual by specs">
        <div>
          <label htmlFor="spec-brand" className="block text-sm font-medium text-foreground mb-1.5">
            Manufacturer / Brand
          </label>
          <input
            id="spec-brand"
            list="spec-make-suggestions"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            placeholder="e.g. BrewTech"
            className={inputClass}
          />
          <datalist id="spec-make-suggestions">
            {DEMO_MAKES.map(m => <option key={m} value={m} />)}
          </datalist>
        </div>

        <div>
          <label htmlFor="spec-model" className="block text-sm font-medium text-foreground mb-1.5">
            Model / Product name
          </label>
          <input
            id="spec-model"
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="e.g. Smart Coffee Maker X1"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="spec-serial" className="block text-sm font-medium text-foreground mb-1.5">
            Serial number{' '}
            <span className="text-xs text-muted-foreground">(optional — narrows the match)</span>
          </label>
          <input
            id="spec-serial"
            value={serial}
            onChange={e => setSerial(e.target.value)}
            placeholder="e.g. SN-123456"
            className={inputClass}
          />
        </div>

        {attempted && !isValid && (
          <p className="text-xs text-destructive" role="alert" aria-live="polite">
            Enter a brand or a model to search.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          className="btn-primary w-full gap-2 py-3 disabled:opacity-60"
          aria-label="Search for product manual"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : <Search className="w-4 h-4" aria-hidden="true" />}
          {loading ? 'Searching…' : 'Find manual'}
        </button>
      </form>

      {apiError && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl border"
          style={{ borderColor: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)' }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive">{apiError}</p>
        </div>
      )}

      {results !== null && results.length === 0 && (
        <p className="text-sm text-center text-muted-foreground py-3" role="status" aria-live="polite">
          No published manuals matched your search. Try a photo search instead, or adjust the brand or model.
        </p>
      )}

      {results !== null && results.length > 1 && (
        <section aria-labelledby="spec-results-label">
          <p id="spec-results-label" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2" aria-live="polite">
            {results.length} manuals found
          </p>
          <ul className="space-y-2" role="list">
            {results.map(r => (
              <li key={r.id}>
                <button
                  onClick={() => router.push(`/manual/${r.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
                  aria-label={`View manual for ${r.productName}${r.productModel ? ` — ${r.productModel}` : ''}`}
                >
                  {r.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.coverImage} alt="" aria-hidden="true" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-subtle)' }} aria-hidden="true">
                      <span className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>
                        {r.productName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{r.productName}</p>
                    <p className="text-xs truncate text-muted-foreground">
                      {[r.brand, r.productModel].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
