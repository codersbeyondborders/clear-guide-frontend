'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    const inputId = id ?? React.useId()
    const errorId = `${inputId}-error`
    const hintId  = `${inputId}-hint`

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type ?? 'text'}
          aria-invalid={!!error}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className={cn(
            'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'border-border-strong',
            'transition-all duration-150',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
