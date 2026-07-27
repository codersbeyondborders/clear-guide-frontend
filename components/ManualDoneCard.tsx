'use client'

import { useState } from 'react'
import { Check, Share2, Download, Globe, FileText, QrCode, BookOpen, Printer } from 'lucide-react'
import type { OutputFormat } from '@/lib/types'

const FORMAT_META: Record<OutputFormat, { label: string; icon: typeof Globe }> = {
  web:         { label: 'Web',            icon: Globe    },
  pdf:         { label: 'PDF',            icon: FileText },
  qr_page:     { label: 'QR Page',        icon: QrCode   },
  epub:        { label: 'ePub',           icon: BookOpen },
  print_ready: { label: 'Print-Ready PDF',icon: Printer  },
}

// Static QR SVG pattern (visual stand-in for a real QR code)
function QRPattern() {
  return (
    <svg viewBox="0 0 21 21" className="w-full h-full" aria-hidden="true">
      {/* Top-left finder */}
      <rect x="0" y="0" width="7" height="7" rx="0.5" fill="var(--color-primary)" />
      <rect x="1" y="1" width="5" height="5" rx="0.3" fill="white" />
      <rect x="2" y="2" width="3" height="3" rx="0.2" fill="var(--color-primary)" />
      {/* Top-right finder */}
      <rect x="14" y="0" width="7" height="7" rx="0.5" fill="var(--color-primary)" />
      <rect x="15" y="1" width="5" height="5" rx="0.3" fill="white" />
      <rect x="16" y="2" width="3" height="3" rx="0.2" fill="var(--color-primary)" />
      {/* Bottom-left finder */}
      <rect x="0" y="14" width="7" height="7" rx="0.5" fill="var(--color-primary)" />
      <rect x="1" y="15" width="5" height="5" rx="0.3" fill="white" />
      <rect x="2" y="16" width="3" height="3" rx="0.2" fill="var(--color-primary)" />
      {/* Data modules */}
      {[
        [9,0],[11,0],[13,0],[8,1],[12,1],[9,2],[11,2],[8,3],[10,3],[12,3],
        [0,8],[2,8],[4,8],[6,8],[8,8],[10,8],[12,8],[14,8],[16,8],[18,8],[20,8],
        [9,9],[11,9],[13,9],[15,9],[17,9],[19,9],
        [8,10],[10,10],[12,10],[14,10],[16,10],[18,10],[20,10],
        [9,11],[11,11],[13,11],[8,12],[10,12],[20,12],
        [9,13],[11,13],[13,13],[15,13],[17,13],[19,13],
        [8,14],[10,14],[16,14],[18,14],[20,14],
        [9,15],[11,15],[13,15],[8,16],[10,16],[12,16],[14,16],[18,16],[20,16],
        [9,17],[11,17],[13,17],[15,17],[8,18],[10,18],[16,18],[18,18],[20,18],
        [9,19],[11,19],[8,20],[10,20],[12,20],[14,20],[16,20],[18,20],[20,20],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="var(--color-primary)" />
      ))}
    </svg>
  )
}

interface ManualDoneCardProps {
  manualId: string | null
  outputFormats?: OutputFormat[]
  onGoToDashboard: () => void
}

export function ManualDoneCard({ manualId, outputFormats = ['web'], onGoToDashboard }: ManualDoneCardProps) {
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'copied' | 'shared'>('idle')

  const handleShare = async () => {
    const url = manualId ? `${window.location.origin}/manual/${manualId}` : window.location.href
    if (navigator.share) {
      await navigator.share({ title: 'ClearGuide Manual', url }).catch(() => null)
      setShareFeedback('shared')
    } else {
      await navigator.clipboard.writeText(url).catch(() => null)
      setShareFeedback('copied')
    }
    setTimeout(() => setShareFeedback('idle'), 2500)
  }

  return (
    <div
      className="w-full max-w-xs rounded-3xl border shadow-xl p-8 flex flex-col items-center gap-5 text-center"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      role="status"
      aria-label="Manual published successfully"
    >
      {/* Check icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <Check className="w-8 h-8 text-white" strokeWidth={3} />
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Manual Ready!
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
          Your manual has been published successfully.
        </p>
      </div>

      {/* QR Code */}
      <div className="w-full space-y-2">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Scan to view manual
        </p>
        <div
          className="w-40 h-40 mx-auto rounded-xl border-2 p-3"
          style={{ borderColor: 'var(--color-primary)' }}
          aria-label="QR code for this manual"
          role="img"
        >
          <QRPattern />
        </div>
      </div>

      {/* Output format badges */}
      {outputFormats.length > 0 && (
        <div className="w-full space-y-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Available formats
          </p>
          <div className="flex flex-wrap justify-center gap-1.5" aria-label="Output formats">
            {outputFormats.map((fmt) => {
              const meta = FORMAT_META[fmt]
              const Icon = meta.icon
              return (
                <span
                  key={fmt}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
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

      {/* Action buttons */}
      {shareFeedback !== 'idle' && (
        <p
          className="text-xs font-medium py-1.5 px-3 rounded-lg w-full text-center"
          style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
          aria-live="polite"
        >
          {shareFeedback === 'copied' ? 'Link copied to clipboard!' : 'Shared successfully!'}
        </p>
      )}

      <div className="flex items-center gap-3 w-full">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            borderColor: shareFeedback !== 'idle' ? 'var(--color-primary)' : 'var(--color-border)',
            color: shareFeedback !== 'idle' ? 'var(--color-primary)' : 'var(--color-foreground)',
            backgroundColor: 'var(--color-card)',
          }}
        >
          {shareFeedback !== 'idle'
            ? <Check className="w-4 h-4" aria-hidden="true" />
            : <Share2 className="w-4 h-4" aria-hidden="true" />
          }
          {shareFeedback !== 'idle' ? 'Copied!' : 'Share'}
        </button>
        <button
          onClick={() => {
            if (manualId) window.open(`/manual/${manualId}`, '_blank')
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Download
        </button>
      </div>

      {/* Go to dashboard */}
      <button
        onClick={onGoToDashboard}
        className="text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        Go to Dashboard
      </button>
    </div>
  )
}
