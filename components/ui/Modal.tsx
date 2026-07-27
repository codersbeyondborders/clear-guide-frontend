'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, description, children, size = 'md', className }: ModalProps) {
  // Trap focus and close on Escape
  React.useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-desc' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-card border border-border rounded-2xl shadow-xl p-6',
          sizeMap[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-foreground">{title}</h2>
            {description && (
              <p id="modal-desc" className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
