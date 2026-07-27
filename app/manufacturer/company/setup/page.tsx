'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Globe, Briefcase, Loader2, Check } from 'lucide-react'

const INDUSTRIES = [
  'Electronics & Technology',
  'Appliances & Home Goods',
  'Automotive & Transportation',
  'Industrial & Manufacturing',
  'Medical Devices & Healthcare',
  'Furniture & Interiors',
  'Sporting Goods & Recreation',
  'Toys & Education',
  'Tools & Hardware',
  'Other',
]

export default function CompanySetupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Company name must be at least 2 characters.'
    if (website && !/^https?:\/\/.+\..+/.test(website)) e.website = 'Enter a valid URL (e.g. https://acme.com).'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setServerError('')
    setLoading(true)
    try {
      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          industry: industry || null,
          website: website.trim() || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Failed to create company.')
      }
      router.push('/manufacturer/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
          >
            <Building2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-balance" style={{ color: 'var(--color-foreground)' }}>
            Set up your company
          </h1>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            Create your company account to invite team members and manage manuals together.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-8 shadow-sm"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Company setup form">

            {/* Company name */}
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                Company name <span aria-hidden="true" style={{ color: 'var(--color-destructive)' }}>*</span>
              </label>
              <input
                id="company-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                placeholder="Acme Corporation"
                required
                aria-required="true"
                aria-describedby={errors.name ? 'name-error' : undefined}
                aria-invalid={!!errors.name}
                className="auth-input"
                style={errors.name ? { borderColor: 'var(--color-destructive)' } : {}}
              />
              {errors.name && (
                <p id="name-error" role="alert" className="mt-1.5 text-xs" style={{ color: 'var(--color-destructive)' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="company-industry" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                Industry <span className="text-xs font-normal" style={{ color: 'var(--color-muted-foreground)' }}>(optional)</span>
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  aria-hidden="true"
                />
                <select
                  id="company-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="auth-input pl-9"
                >
                  <option value="">Select an industry…</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="company-website" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-foreground)' }}>
                Website <span className="text-xs font-normal" style={{ color: 'var(--color-muted-foreground)' }}>(optional)</span>
              </label>
              <div className="relative">
                <Globe
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  aria-hidden="true"
                />
                <input
                  id="company-website"
                  type="url"
                  value={website}
                  onChange={(e) => { setWebsite(e.target.value); setErrors(p => ({ ...p, website: '' })) }}
                  placeholder="https://acme.com"
                  aria-describedby={errors.website ? 'website-error' : undefined}
                  aria-invalid={!!errors.website}
                  className="auth-input pl-9"
                  style={errors.website ? { borderColor: 'var(--color-destructive)' } : {}}
                />
              </div>
              {errors.website && (
                <p id="website-error" role="alert" className="mt-1.5 text-xs" style={{ color: 'var(--color-destructive)' }}>
                  {errors.website}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                aria-live="polite"
                className="px-4 py-3 rounded-xl border text-sm"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                  color: 'var(--color-destructive)',
                  borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
                }}
              >
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Creating company…</>
              ) : (
                <><Check className="w-4 h-4" aria-hidden="true" /> Create company</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-muted-foreground)' }}>
          You can update these details any time in Settings &rarr; Team.
        </p>
      </div>
    </main>
  )
}
