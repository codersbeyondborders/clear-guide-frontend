'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

const AI_STEPS = [
  'Parsing document structure...',
  'Extracting sections and headings...',
  'Generating accessibility metadata...',
  'Building AI knowledge base...',
  'Optimising for multimodal delivery...',
  'Finalising and publishing...',
]

interface AIProcessingOverlayProps {
  visible: boolean
  onComplete: () => void
}

export function AIProcessingOverlay({ visible, onComplete }: AIProcessingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0)
      setProgress(0)
      return
    }

    const stepDuration = 800
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1
        const pct = Math.round((next / AI_STEPS.length) * 100)
        setProgress(pct)
        if (next >= AI_STEPS.length) {
          clearInterval(interval)
          setTimeout(onComplete, 800)
        }
        return next
      })
    }, stepDuration)

    return () => clearInterval(interval)
  }, [visible, onComplete])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="AI is processing your manual"
      aria-live="polite"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl border shadow-2xl p-8 space-y-5"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Sparkle icon */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          >
            {/* Sparkle / AI icon */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 4L17.8 12.2L26 14L17.8 15.8L16 24L14.2 15.8L6 14L14.2 12.2L16 4Z" fill="var(--color-primary)" />
              <path d="M26 22L26.9 25.1L30 26L26.9 26.9L26 30L25.1 26.9L22 26L25.1 25.1L26 22Z" fill="var(--color-primary)" opacity="0.7" />
              <path d="M7 4L7.7 6.3L10 7L7.7 7.7L7 10L6.3 7.7L4 7L6.3 6.3L7 4Z" fill="var(--color-primary)" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
            AI is Processing
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            Hang tight while we build your accessible manual.
          </p>
        </div>

        {/* Step list */}
        <ol className="space-y-2.5" aria-label="Processing steps">
          {AI_STEPS.map((step, i) => {
            const isCompleted = i < currentStep
            const isActive = i === currentStep

            return (
              <li key={step} className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle2
                    className="w-5 h-5 shrink-0"
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                ) : isActive ? (
                  <Loader2
                    className="w-5 h-5 shrink-0 animate-spin"
                    style={{ color: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className="w-5 h-5 rounded-full border-2 shrink-0"
                    style={{ borderColor: 'var(--color-border)' }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="text-sm"
                  style={{
                    color: isCompleted
                      ? 'var(--color-primary)'
                      : isActive
                      ? 'var(--color-foreground)'
                      : 'var(--color-muted-foreground)',
                    fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                  }}
                >
                  {step}
                </span>
              </li>
            )
          })}
        </ol>

        {/* Progress bar */}
        <div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-background-subtle)' }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}% complete`}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
