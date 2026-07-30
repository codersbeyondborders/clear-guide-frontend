'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor } from '@/context/ManualEditorContext'
import { AIProcessingOverlay } from '@/components/AIProcessingOverlay'
import { FileText, Globe, Upload, LayoutList, Eye, Lock, FileDown, QrCode, BookOpen, Printer, ClipboardCheck, Send, Rocket } from 'lucide-react'
import type { OutputFormat } from '@/lib/types'
import { authFetch } from '@/lib/apiClient'

const OUTPUT_FORMAT_OPTIONS: { value: OutputFormat; Icon: React.FC<{ className?: string; style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>; title: string; desc: string }[] = [
  { value: 'web',         Icon: Globe,    title: 'Web (Interactive)',   desc: 'Responsive viewer with AI chat and search. Always included.' },
  { value: 'pdf',         Icon: FileDown, title: 'PDF Download',        desc: 'AI-generated PDF attached to the manual page.' },
  { value: 'qr_page',     Icon: QrCode,   title: 'QR Landing Page',     desc: 'Branded mobile-optimised page for QR code scans.' },
  { value: 'epub',        Icon: BookOpen, title: 'ePub / E-reader',      desc: 'Portable format for Kindle and iBooks.' },
  { value: 'print_ready', Icon: Printer,  title: 'Print-Ready PDF',     desc: 'High-res PDF with bleeds for professional printing.' },
]

export function Step4({ isEdit = false }: { isEdit?: boolean }) {
  const { formData, manualId, setStep } = useEditor()
  const router = useRouter()
  const [status, setStatus] = useState<'draft' | 'pending_review' | 'published'>(
    (formData.status as 'draft' | 'pending_review' | 'published') ?? 'draft',
  )
  const [isPublic, setIsPublic] = useState<boolean>(formData.isPublic)
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>(
    (formData as { outputFormats?: OutputFormat[] }).outputFormats ?? ['web'],
  )
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  function toggleFormat(fmt: OutputFormat) {
    if (fmt === 'web') return // web is always required
    setOutputFormats((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt],
    )
  }

  const handleSave = async () => {
    setError('')
    setProcessing(true)
    try {
      const payload = {
        productName: formData.productName,
        productModel: formData.productModel,
        brand: formData.brand,
        serialNumber: formData.serialNumber || null,
        languages: formData.languages,
        status,
        isPublic,
        outputFormats,
        uploadMethod: formData.uploadMethod,
        originalFileUrl: formData.uploadedFilePathname ?? null,
        sections: formData.sections,
      }

      const url = isEdit && manualId ? `/api/manuals/${manualId}` : '/api/manuals'
      const method = isEdit && manualId ? 'PUT' : 'POST'

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to save manual')
      }
      // AIProcessingOverlay will call onComplete after animation finishes
    } catch (err: unknown) {
      setProcessing(false)
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    }
  }

  const onOverlayComplete = useCallback(() => {
    // Clear draft from localStorage
    try { localStorage.removeItem('clearguide_editor_draft') } catch { /* ignore */ }
    router.push('/manufacturer/dashboard')
  }, [router])

  const additionalLangs = formData.languages.filter((l) => l !== 'en')

  return (
    <>
      <section aria-labelledby="step4-title">
        <div className="space-y-1 mb-8">
          <h2 id="step4-title" className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            Review & {isEdit ? 'Update' : 'Publish'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Review your manual details before saving.
          </p>
        </div>

        {/* Summary card */}
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Product Name', value: formData.productName },
              { label: 'Model',        value: formData.productModel },
              { label: 'Brand',        value: formData.brand },
              { label: 'Serial #',     value: formData.serialNumber || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {label}
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="pt-4 border-t flex flex-wrap gap-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
              <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                {formData.languages.length} {formData.languages.length === 1 ? 'language' : 'languages'}
                {additionalLangs.length > 0 && (
                  <span style={{ color: 'var(--color-muted-foreground)' }}>
                    {' '}(+{additionalLangs.length} AI translated)
                  </span>
                )}
              </span>
            </div>
            {formData.uploadMethod === 'upload' && formData.uploadedFileName && (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                <span className="text-sm truncate max-w-[200px]" style={{ color: 'var(--color-foreground)' }}>
                  {formData.uploadedFileName}
                </span>
              </div>
            )}
            {formData.uploadMethod === 'sections' && (
              <div className="flex items-center gap-2">
                <LayoutList className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                  {formData.sections.length} {formData.sections.length === 1 ? 'section' : 'sections'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Output formats */}
        <fieldset className="mt-6 space-y-3">
          <legend className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Output formats
          </legend>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Choose how this manual will be delivered. Web is always included.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {OUTPUT_FORMAT_OPTIONS.map(({ value, Icon, title, desc }) => {
              const selected = outputFormats.includes(value)
              const locked = value === 'web'
              return (
                <label
                  key={value}
                  className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring"
                  style={{
                    borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: selected ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                    opacity: locked ? 0.8 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    onChange={() => toggleFormat(value)}
                    disabled={locked}
                    aria-label={title}
                  />
                  <Icon
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: selected ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight" style={{ color: 'var(--color-foreground)' }}>
                      {title}
                      {locked && (
                        <span className="ml-1.5 text-[10px] font-normal px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
                          Required
                        </span>
                      )}
                    </span>
                    <span className="block text-xs mt-0.5 leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
                      {desc}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* Save mode */}
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Save as</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {([
              {
                value: 'draft' as const,
                Icon: ClipboardCheck,
                title: 'Save as Draft',
                desc: 'Not visible publicly. Continue editing any time.',
              },
              {
                value: 'pending_review' as const,
                Icon: Send,
                title: 'Submit for Review',
                desc: 'Send to your team for approval before it goes live.',
              },
              {
                value: 'published' as const,
                Icon: Rocket,
                title: 'Publish Now',
                desc: 'Make it immediately live for end users.',
              },
            ] as const).map(({ value, Icon, title, desc }) => {
              const selected = status === value
              return (
                <label
                  key={value}
                  className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring"
                  style={{
                    borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: selected ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                  }}
                >
                  <input
                    type="radio"
                    name="save-mode"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setStatus(value)}
                  />
                  <Icon
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: selected ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      {title}
                    </span>
                    <span className="block text-xs mt-0.5 leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
                      {desc}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Visibility (public/private) */}
        <fieldset className="mt-6 space-y-3">
          <legend className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            Product listing visibility
          </legend>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Controls whether this product appears in the public Products Forum. Your QR code and
            direct link keep working either way.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
            {([
              {
                value: true,
                Icon: Eye,
                title: 'Public',
                desc: 'Listed in the Products Forum so anyone can find it, browse the guide, and see reviews.',
              },
              {
                value: false,
                Icon: Lock,
                title: 'Private',
                desc: 'Hidden from the Products Forum. Only people with the QR code or direct link can open it.',
              },
            ] as const).map(({ value, Icon, title, desc }) => {
              const selected = isPublic === value
              return (
                <label
                  key={title}
                  className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-ring"
                  style={{
                    borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: selected ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                  }}
                >
                  <input
                    type="radio"
                    name="visibility"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setIsPublic(value)}
                  />
                  <Icon
                    className="w-5 h-5 shrink-0 mt-0.5"
                    style={{ color: selected ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      {title}
                    </span>
                    <span className="block text-xs mt-0.5 leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
                      {desc}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-4 px-4 py-3 rounded-lg border text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              color: 'var(--color-destructive)',
              borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-8">
          <button type="button" onClick={() => setStep(3)} className="btn-outline">
            Back
          </button>
          <div className="flex items-center gap-3">
            <a
              href="/manufacturer/dashboard"
              className="btn-ghost text-sm"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Cancel
            </a>
            <button
              type="button"
              onClick={handleSave}
              disabled={processing}
              className="btn-primary"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              {processing
                ? 'Saving…'
                : status === 'pending_review'
                  ? 'Submit for Review'
                  : status === 'published'
                    ? (isEdit ? 'Update & Publish' : 'Publish Now')
                    : (isEdit ? 'Update Draft' : 'Save Draft')}
            </button>
          </div>
        </div>
      </section>

      <AIProcessingOverlay visible={processing} onComplete={onOverlayComplete} />
    </>
  )
}
