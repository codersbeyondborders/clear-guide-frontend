'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Settings, BarChart2, Trash2, Share2, Check, Eye, Clock, ClipboardCheck } from 'lucide-react'
import Image from 'next/image'
import type { ManualListItem } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${String(s % 60).padStart(2, '0')}s`
}

function formatCount(n: number): string {
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const STATUS_CONFIG = {
  published:      { label: 'Published',      bg: 'var(--color-primary-subtle)',                              color: 'var(--color-primary)'            },
  pending_review: { label: 'Pending Review', bg: 'color-mix(in srgb, #f59e0b 12%, transparent)',             color: '#d97706'                         },
  draft:          { label: 'Draft',          bg: 'color-mix(in srgb, #d97706 10%, transparent)',             color: '#d97706'                         },
  processing:     { label: 'Processing',     bg: 'color-mix(in srgb, #0284c7 10%, transparent)',             color: '#0284c7'                         },
  archived:       { label: 'Archived',       bg: 'var(--color-background-subtle)',                           color: 'var(--color-muted-foreground)'   },
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'EN', es: 'ES', fr: 'FR', de: 'DE', it: 'IT',
  pt: 'PT', ja: 'JA', zh: 'ZH', ar: 'AR', ko: 'KO',
}

// ---------------------------------------------------------------------------
// Cover thumbnail
// ---------------------------------------------------------------------------
function CoverThumbnail({ coverImage, productName }: { coverImage: string | null; productName: string }) {
  if (coverImage) {
    return (
      <div className="relative w-full h-36 overflow-hidden rounded-t-2xl" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <Image
          src={coverImage}
          alt={`Cover image for ${productName}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          crossOrigin="anonymous"
        />
      </div>
    )
  }

  return (
    <div
      className="w-full h-36 rounded-t-2xl flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-primary-subtle)' }}
      aria-hidden="true"
    >
      <FileText className="w-10 h-10 opacity-40" style={{ color: 'var(--color-primary)' }} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ManualCardProps {
  manual: ManualListItem
  onDelete: (id: string) => void
  /** Render as a compact horizontal list row instead of the default card */
  listMode?: boolean
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export function ManualCard({ manual, onDelete, listMode = false }: ManualCardProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const statusCfg = STATUS_CONFIG[manual.status] ?? STATUS_CONFIG.draft
  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/manual/${manual.id}`
    : `/manual/${manual.id}`

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing silently
    }
  }

  const visibleLangs = (manual.languages ?? []).slice(0, 3)
  const extraLangs = (manual.languages ?? []).length - 3

  // ── List (row) layout ────────────────────────────────────────────────────
  if (listMode) {
    return (
      <article
        className="group flex items-center gap-4 px-4 py-3 border-b last:border-b-0 transition-colors"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Small icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          aria-hidden="true"
        >
          <FileText className="w-4 h-4 opacity-60" style={{ color: 'var(--color-primary)' }} />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
              {manual.productName}
            </p>
            <span
              className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
            >
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {manual.productModel && (
              <span className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
                {manual.productModel}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              <Eye className="w-3 h-3" aria-hidden="true" />
              {formatCount(manual.viewCount)}
            </span>
            {manual.avgTimeSeconds > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                <Clock className="w-3 h-3" aria-hidden="true" />
                {formatSeconds(manual.avgTimeSeconds)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => router.push(`/manufacturer/edit/${manual.id}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-foreground)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
            aria-label={`Edit ${manual.productName}`}
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={() => router.push(`/manufacturer/analytics/${manual.id}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-foreground)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
            aria-label={`View analytics for ${manual.productName}`}
          >
            <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            onClick={handleShare}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              borderColor: copied ? 'var(--color-primary)' : 'var(--color-border)',
              color: copied ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
              backgroundColor: copied ? 'var(--color-primary-subtle)' : 'var(--color-card)',
            }}
            aria-label={copied ? 'Link copied!' : `Copy link for ${manual.productName}`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(manual.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-destructive)'; e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-destructive) 40%, transparent)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted-foreground)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
            aria-label={`Delete ${manual.productName}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </article>
    )
  }

  // ── Default grid card layout ─────────────────────────────────────────────
  return (
    <article
      className="group rounded-2xl border flex flex-col transition-all duration-200 hover:shadow-md overflow-hidden"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Cover */}
      <div className="relative shrink-0">
        <CoverThumbnail coverImage={manual.coverImage} productName={manual.productName} />
        {/* Status badge — overlaid top-right */}
        <span
          className="absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title + date */}
        <div className="space-y-0.5">
          <h3
            className="text-sm font-bold leading-snug line-clamp-2 text-balance"
            style={{ color: 'var(--color-foreground)' }}
          >
            {manual.productName}
          </h3>
          {manual.productModel && (
            <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
              {manual.productModel}
            </p>
          )}
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Updated {formatDate(manual.updatedAt)}
          </p>
        </div>

        {/* Inline stats */}
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--color-muted-foreground)' }}
            title={`${manual.viewCount} total views`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {formatCount(manual.viewCount)} views
          </span>
          {manual.avgTimeSeconds > 0 && (
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--color-muted-foreground)' }}
              title={`Avg. time: ${formatSeconds(manual.avgTimeSeconds)}`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {formatSeconds(manual.avgTimeSeconds)} avg
            </span>
          )}
        </div>

        {/* Language chips */}
        {visibleLangs.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {visibleLangs.map((lang) => (
              <span
                key={lang}
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-background-subtle)',
                  color: 'var(--color-muted-foreground)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {LANGUAGE_LABELS[lang] ?? lang.toUpperCase()}
              </span>
            ))}
            {extraLangs > 0 && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-background-subtle)',
                  color: 'var(--color-muted-foreground)',
                  border: '1px solid var(--color-border)',
                }}
              >
                +{extraLangs}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div
          className="flex items-center gap-2 pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => router.push(`/manufacturer/edit/${manual.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)',
              backgroundColor: 'var(--color-card)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.color = 'var(--color-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-foreground)'
            }}
            aria-label={`Edit ${manual.productName}`}
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            Edit
          </button>

          <button
            onClick={() => router.push(`/manufacturer/analytics/${manual.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)',
              backgroundColor: 'var(--color-card)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
              e.currentTarget.style.color = 'var(--color-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-foreground)'
            }}
            aria-label={`View analytics for ${manual.productName}`}
          >
            <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
            Stats
          </button>

          {/* Review action — shown only when pending_review */}
          {manual.status === 'pending_review' && (
            <button
              onClick={() => router.push(`/manufacturer/review/${manual.id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                borderColor: '#d97706',
                color: '#d97706',
                backgroundColor: 'color-mix(in srgb, #f59e0b 10%, transparent)',
              }}
              aria-label={`Review ${manual.productName}`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Review
            </button>
          )}

          {/* Share / copy link */}
          <button
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
            style={{
              borderColor: copied ? 'var(--color-primary)' : 'var(--color-border)',
              color: copied ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
              backgroundColor: copied ? 'var(--color-primary-subtle)' : 'var(--color-card)',
            }}
            aria-label={copied ? 'Link copied!' : `Copy public link for ${manual.productName}`}
            title={copied ? 'Copied!' : 'Copy public link'}
          >
            {copied
              ? <Check className="w-3.5 h-3.5" aria-hidden="true" />
              : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
            }
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(manual.id)}
            className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-destructive) 40%, transparent)'
              e.currentTarget.style.color = 'var(--color-destructive)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
              e.currentTarget.style.color = 'var(--color-muted-foreground)'
            }}
            aria-label={`Delete ${manual.productName}`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
