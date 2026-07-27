'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ─── Checkbox ─────────────────────────────────────────────────────────── */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id ?? React.useId()
    const errorId    = `${checkboxId}-error`

    return (
      <div className="flex gap-3">
        <input
          id={checkboxId}
          ref={ref}
          type="checkbox"
          aria-describedby={cn(error && errorId, description && `${checkboxId}-desc`) || undefined}
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong bg-background',
            'accent-primary cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <div className="flex flex-col gap-0.5">
          <label htmlFor={checkboxId} className="text-sm font-medium text-foreground cursor-pointer leading-5">
            {label}
          </label>
          {description && (
            <p id={`${checkboxId}-desc`} className="text-xs text-muted-foreground">{description}</p>
          )}
          {error && (
            <p id={errorId} role="alert" aria-live="polite" className="text-xs text-destructive">{error}</p>
          )}
        </div>
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

/* ─── Radio ─────────────────────────────────────────────────────────────── */

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const radioId = id ?? React.useId()

    return (
      <div className="flex gap-3">
        <input
          id={radioId}
          ref={ref}
          type="radio"
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 border-border-strong bg-background',
            'accent-primary cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
        <div className="flex flex-col gap-0.5">
          <label htmlFor={radioId} className="text-sm font-medium text-foreground cursor-pointer leading-5">
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    )
  },
)
Radio.displayName = 'Radio'
