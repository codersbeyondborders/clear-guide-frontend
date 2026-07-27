'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, AlertCircle, ChevronRight } from 'lucide-react'

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

export function ManualSearchForm() {
  const router = useRouter()

  const [brand,  setBrand]  = useState('')
  const [model,  setModel]  = useState('')
  const [serial, setSerial] = useState('')
  const [touched, setTouched] = useState({ brand: false, model: false })

  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState<SearchResult[] | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const isValid = brand.trim().length > 0 && model.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ brand: true, model: true })
    if (!isValid) return

    setLoading(true)
    setApiError(null)
    setResults(null)

    try {
      const params = new URLSearchParams({ brand: brand.trim(), model: model.trim() })
      if (serial.trim()) params.set('serial', serial.trim())

      const res = await fetch(`/api/public/manuals/search?${params}`)
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Search failed.')
      }
      const data = await res.json() as { results: SearchResult[] }

      if (data.results.length === 1) {
        // Direct navigate when there is exactly one match
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

  const inputClass = (hasError: boolean) =>
    [
      'w-full h-11 px-4 rounded-lg text-sm border transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
      hasError
        ? 'border-destructive bg-card text-foreground'
        : 'border-border bg-card text-foreground placeholder:text-muted-foreground',
    ].join(' ')

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Search for a product manual">

        {/* Brand */}
        <div>
          <label htmlFor="search-brand" className="block text-sm font-medium text-foreground mb-1.5">
            Manufacturer / Make <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <input
            id="search-brand"
            list="make-suggestions"
            value={brand}
            onChange={e => setBrand(e.target.value)}
            onBlur={() => setTouched(p => ({ ...p, brand: true }))}
            placeholder="e.g. BrewTech"
            required
            aria-required="true"
            aria-describedby={touched.brand && !brand.trim() ? 'brand-error' : undefined}
            className={inputClass(touched.brand && !brand.trim())}
          />
          <datalist id="make-suggestions">
            {DEMO_MAKES.map(m => <option key={m} value={m} />)}
          </datalist>
          {touched.brand && !brand.trim() && (
            <p id="brand-error" className="mt-1 text-xs text-destructive" role="alert">
              Manufacturer is required.
            </p>
          )}
        </div>

        {/* Model */}
        <div>
          <label htmlFor="search-model" className="block text-sm font-medium text-foreground mb-1.5">
            Model <span className="text-destructive" aria-hidden="true">*</span>
          </label>
          <input
            id="search-model"
            value={model}
            onChange={e => setModel(e.target.value)}
            onBlur={() => setTouched(p => ({ ...p, model: true }))}
            placeholder="e.g. Smart Coffee Maker X1"
            required
            aria-required="true"
            aria-describedby={touched.model && !model.trim() ? 'model-error' : undefined}
            className={inputClass(touched.model && !model.trim())}
          />
          {touched.model && !model.trim() && (
            <p id="model-error" className="mt-1 text-xs text-destructive" role="alert">
              Model is required.
            </p>
          )}
        </div>

        {/* Serial (optional) */}
        <div>
          <label htmlFor="search-serial" className="block text-sm font-medium text-foreground mb-1.5">
            Serial Number{' '}
            <span className="text-xs text-muted-foreground">(optional — narrows the match)</span>
          </label>
          <input
            id="search-serial"
            value={serial}
            onChange={e => setSerial(e.target.value)}
            placeholder="e.g. SN-123456"
            className={inputClass(false)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full gap-2 py-3 disabled:opacity-60"
          aria-label="Search for product manual"
        >
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            : <Search className="w-4 h-4" aria-hidden="true" />
          }
          {loading ? 'Searching...' : 'Find Manual'}
        </button>
      </form>

      {/* API error */}
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

      {/* Results list */}
      {results !== null && results.length === 0 && (
        <p
          className="text-sm text-center text-muted-foreground py-3"
          role="status"
          aria-live="polite"
        >
          No published manuals matched your search. Try adjusting the brand or model.
        </p>
      )}

      {results !== null && results.length > 1 && (
        <section aria-labelledby="results-label">
          <p
            id="results-label"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
            aria-live="polite"
          >
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
                    <img
                      src={r.coverImage}
                      alt=""
                      aria-hidden="true"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                      aria-hidden="true"
                    >
                      <span className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>
                        {r.productName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">
                      {r.productName}
                    </p>
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
