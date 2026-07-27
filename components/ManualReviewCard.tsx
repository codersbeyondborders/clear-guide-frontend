'use client'

import { useState } from 'react'
import {
  Check, ChevronDown, ChevronUp, ClipboardCheck, AlertTriangle,
  Globe, FileText, QrCode, BookOpen, Printer, Loader2,
} from 'lucide-react'
import type { OutputFormat } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ReviewSection {
  id: string
  title: string
  contentSnippet: string
}

export interface ManualReviewCardProps {
  manualId: string | null
  productName: string
  productModel: string | null
  brand: string | null
  sections: ReviewSection[]
  outputFormats: OutputFormat[]
  onRequestChanges: () => void
  onApproveAndPublish: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Format meta
// ---------------------------------------------------------------------------
const FORMAT_META: Record<OutputFormat, { label: string; icon: typeof Globe }> = {
  web:         { label: 'Web',             icon: Globe    },
  pdf:         { label: 'PDF',             icon: FileText },
  qr_page:     { label: 'QR Page',         icon: QrCode   },
  epub:        { label: 'ePub',            icon: BookOpen },
  print_ready: { label: 'Print-Ready PDF', icon: Printer  },
}

// ---------------------------------------------------------------------------
// Checklist items
// ---------------------------------------------------------------------------
const CHECKLIST_ITEMS = [
  { id: 'c1', label: 'Content is accurate and complete' },
  { id: 'c2', label: 'Sections are in the correct order' },
  { id: 'c3', label: 'Output formats are appropriate' },
  { id: 'c4', label: 'Ready for end users' },
]

// ---------------------------------------------------------------------------
// Section accordion row
// ---------------------------------------------------------------------------
function SectionRow({ section, index }: { section: ReviewSection; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls={`section-content-${section.id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0"
            style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
            {section.title || `Section ${index + 1}`}
          </span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
          : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
        }
      </button>
      {open && (
        <div
          id={`section-content-${section.id}`}
          className="px-4 pb-4"
        >
          <div
            className="rounded-lg p-3 border text-sm leading-relaxed"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-card)',
              color: 'var(--color-muted-foreground)',
            }}
          >
            {section.contentSnippet || 'No content preview available.'}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ManualReviewCard
// ---------------------------------------------------------------------------
export function ManualReviewCard({
  manualId,
  productName,
  productModel,
  brand,
  sections,
  outputFormats,
  onRequestChanges,
  onApproveAndPublish,
}: ManualReviewCardProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allChecked = CHECKLIST_ITEMS.every((item) => checked[item.id])

  const toggleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleApprove = async () => {
    if (!allChecked) return
    setPublishing(true)
    setError(null)
    try {
      await onApproveAndPublish()
    } catch {
      setError('Failed to publish. Please try again.')
      setPublishing(false)
    }
  }

  const checkedCount = CHECKLIST_ITEMS.filter((i) => checked[i.id]).length

  return (
    <div
      className="w-full max-w-xl rounded-3xl border shadow-xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      role="main"
      aria-label="Manual review before publishing"
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="px-7 py-5 border-b flex items-start justify-between gap-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}
      >
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: 'color-mix(in srgb, #f59e0b 12%, transparent)',
                color: '#d97706',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
              Pending Review
            </span>
          </div>
          <h2 className="text-lg font-bold text-pretty" style={{ color: 'var(--color-foreground)' }}>
            {productName}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {[brand, productModel].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="shrink-0 text-right space-y-0.5">
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Sections</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>{sections.length}</p>
        </div>
      </div>

      <div className="px-7 py-6 space-y-6">
        {/* ── Output formats ──────────────────────────────────────────────── */}
        {outputFormats.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted-foreground)' }}>
              Output Formats
            </p>
            <div className="flex flex-wrap gap-2">
              {outputFormats.map((fmt) => {
                const meta = FORMAT_META[fmt]
                const Icon = meta.icon
                return (
                  <span
                    key={fmt}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                  >
                    <Icon className="w-3 h-3" aria-hidden="true" />
                    {meta.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Section preview ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted-foreground)' }}>
            Section Preview
          </p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1" role="list" aria-label="Manual sections">
            {sections.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>No sections added yet.</p>
            ) : (
              sections.map((section, idx) => (
                <div key={section.id} role="listitem">
                  <SectionRow section={section} index={idx} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Review checklist ────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                Review Checklist
              </p>
            </div>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
              aria-live="polite"
            >
              {checkedCount}/{CHECKLIST_ITEMS.length}
            </span>
          </div>
          <fieldset>
            <legend className="sr-only">Pre-publish review checklist</legend>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => {
                const isChecked = !!checked[item.id]
                return (
                  <label
                    key={item.id}
                    htmlFor={`check-${item.id}`}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className="relative w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        borderColor: isChecked ? 'var(--color-primary)' : 'var(--color-border-strong)',
                        backgroundColor: isChecked ? 'var(--color-primary)' : 'transparent',
                      }}
                      aria-hidden="true"
                    >
                      {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <input
                      id={`check-${item.id}`}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(item.id)}
                      className="sr-only"
                    />
                    <span
                      className="text-sm"
                      style={{ color: isChecked ? 'var(--color-foreground)' : 'var(--color-muted-foreground)', textDecoration: isChecked ? 'none' : 'none' }}
                    >
                      {item.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              color: 'var(--color-destructive)',
              borderColor: 'color-mix(in srgb, var(--color-destructive) 25%, transparent)',
            }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onRequestChanges}
            disabled={publishing}
            className="flex-1 py-3 px-4 rounded-full border text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)',
              backgroundColor: 'var(--color-card)',
            }}
          >
            Request Changes
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!allChecked || publishing}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            {publishing
              ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Publishing…</>
              : <><Check className="w-4 h-4" aria-hidden="true" /> Approve &amp; Publish</>
            }
          </button>
        </div>
        {!allChecked && (
          <p className="text-xs text-center" style={{ color: 'var(--color-muted-foreground)' }} aria-live="polite">
            Complete all checklist items to enable publishing.
          </p>
        )}
      </div>
    </div>
  )
}
