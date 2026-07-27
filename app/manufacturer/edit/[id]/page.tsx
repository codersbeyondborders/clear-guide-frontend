'use client'

import { use, useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { ManualEditorProvider, useEditor, type EditorFormData } from '@/context/ManualEditorContext'
import { Step1 } from '@/app/manufacturer/new/_components/Step1'
import { Step2 } from '@/app/manufacturer/new/_components/Step2'
import { Step3 } from '@/app/manufacturer/new/_components/Step3'
import { Step4 } from '@/app/manufacturer/new/_components/Step4'

// ---------------------------------------------------------------------------
// ClearGuide logo — matches the New Manual header
// ---------------------------------------------------------------------------
function ClearGuideLogo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="4" rx="1" fill="white" opacity="0.7" />
          <rect x="2" y="11" width="14" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="14" width="10" height="2" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div className="leading-none">
        <span className="block text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-sm font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step indicator — identical to New Manual's indicator
// ---------------------------------------------------------------------------
const STEPS = [
  { number: 1, label: 'Basic Info'  },
  { number: 2, label: 'Languages'  },
  { number: 3, label: 'Content'    },
  { number: 4, label: 'Publish'    },
] as const

function StepIndicator() {
  const { step, setStep } = useEditor()
  return (
    <nav aria-label="Editor steps" className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const isCompleted = step > s.number
        const isActive    = step === s.number
        return (
          <div key={s.number} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => isCompleted && setStep(s.number as 1 | 2 | 3 | 4)}
              disabled={!isCompleted}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${s.number}: ${s.label}${isCompleted ? ' (completed)' : ''}`}
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-1 py-0.5"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor:
                    isCompleted || isActive
                      ? 'var(--color-primary)'
                      : 'var(--color-background-subtle)',
                  color:
                    isCompleted || isActive
                      ? 'var(--color-primary-foreground)'
                      : 'var(--color-muted-foreground)',
                }}
                aria-hidden="true"
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s.number}
              </span>
              <span
                className="text-sm font-medium hidden sm:block"
                style={{
                  color: isActive
                    ? 'var(--color-foreground)'
                    : isCompleted
                    ? 'var(--color-primary)'
                    : 'var(--color-muted-foreground)',
                }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="w-6 h-px"
                style={{
                  backgroundColor:
                    step > s.number ? 'var(--color-primary)' : 'var(--color-border)',
                }}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Edit layout shell — mirrors the New Manual shell exactly
// ---------------------------------------------------------------------------
function EditLayout() {
  const { step } = useEditor()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Header — identical structure to New Manual */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: back + logo + breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/manufacturer/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Back to dashboard"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <ClearGuideLogo />
            <span style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true">/</span>
            <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              Edit Manual
            </span>
          </div>

          {/* Centre: step indicator */}
          <StepIndicator />
        </div>
      </header>

      {/* Main content — same max-width and card treatment as New Manual */}
      <main className="max-w-3xl mx-auto px-6 py-8" id="main-content">
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 isEdit />}
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page — fetches manual data, populates context, renders EditLayout
// ---------------------------------------------------------------------------
export default function EditManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [initialData, setInitialData] = useState<Partial<EditorFormData> | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    fetch(`/api/manuals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setInitialData({
          productName:      data.productName  ?? '',
          productModel:     data.productModel ?? '',
          brand:            data.brand        ?? '',
          serialNumber:     data.serialNumber ?? '',
          languages:        data.languages    ?? ['en'],
          uploadMethod:     data.sections?.length > 0 ? 'sections' : 'upload',
          sections: (data.sections ?? []).map((s: {
            id: string
            title: string
            content: string
            imageUrls: string[]
            videoUrls: string[]
          }) => ({
            id:        s.id,
            title:     s.title,
            content:   s.content   ?? '',
            imageUrls: s.imageUrls ?? [],
            videoUrls: s.videoUrls ?? [],
          })),
          status:             data.status ?? 'draft',
          isPublic:           data.isPublic ?? true,
          uploadedFileName:   null,
          uploadedFileSize:   null,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
      >
        <div
          className="text-sm animate-pulse"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Loading manual&hellip;
        </div>
      </div>
    )
  }

  // Error state
  if (error || !initialData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
      >
        <div className="text-center space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-destructive)' }}>
            {error || 'Manual not found'}
          </p>
          <a href="/manufacturer/dashboard" className="btn-outline text-sm">
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <ManualEditorProvider initialData={initialData} initialId={id}>
      <EditLayout />
    </ManualEditorProvider>
  )
}
