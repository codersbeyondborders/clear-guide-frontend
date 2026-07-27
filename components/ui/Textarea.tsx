'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, maxLength, showCount, id, value, onChange, ...props }, ref) => {
    const textareaId = id ?? React.useId()
    const errorId = `${textareaId}-error`
    const [charCount, setCharCount] = React.useState(() =>
      typeof value === 'string' ? value.length : 0,
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const isNearLimit = maxLength && charCount >= maxLength * 0.9
    const isAtLimit   = maxLength && charCount >= maxLength

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'flex min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground',
            'placeholder:text-muted-foreground resize-y',
            'border-border-strong',
            'transition-all duration-150',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between gap-2">
          <div>
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && (
              <p id={errorId} role="alert" aria-live="polite" className="text-xs text-destructive">{error}</p>
            )}
          </div>
          {showCount && maxLength && (
            <p
              aria-live="polite"
              className={cn('text-xs tabular-nums ml-auto shrink-0',
                isAtLimit   ? 'text-destructive font-semibold' :
                isNearLimit ? 'text-warning' :
                'text-muted-foreground'
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
