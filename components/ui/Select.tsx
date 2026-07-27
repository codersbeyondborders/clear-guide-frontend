'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options: { value: string; label: string; disabled?: boolean }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, placeholder, options, id, ...props }, ref) => {
    const selectId = id ?? React.useId()
    const errorId  = `${selectId}-error`

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-sm text-foreground',
              'border-border-strong',
              'transition-all duration-150',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
        {error && (
          <p id={errorId} role="alert" aria-live="polite" className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  },
)
Select.displayName = 'Select'
