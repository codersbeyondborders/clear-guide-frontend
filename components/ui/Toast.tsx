'use client'

import * as React from 'react'
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  onDismiss: (id: string) => void
}

const variantConfig: Record<ToastVariant, { icon: React.ElementType; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-primary/30 bg-primary-subtle text-primary' },
  error:   { icon: XCircle,      className: 'border-destructive/30 bg-destructive/5 text-destructive' },
  warning: { icon: AlertTriangle,className: 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800' },
  info:    { icon: Info,          className: 'border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800' },
}

export function Toast({ id, variant, title, description, onDismiss }: ToastProps) {
  const { icon: Icon, className } = variantConfig[variant]

  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 5000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg',
        'bg-card',
        className,
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

/* ─── Toast context ─────────────────────────────────────────────────────── */

interface ToastItem extends Omit<ToastProps, 'onDismiss'> {}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const addToast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...item, id }])
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
