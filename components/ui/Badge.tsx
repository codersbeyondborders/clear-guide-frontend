import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ManualStatus } from '@/lib/types'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | ManualStatus

const variantMap: Record<string, string> = {
  default:     'badge-slate',
  success:     'badge-green',
  published:   'badge-green',
  warning:     'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  processing:  'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  danger:      'badge-red',
  archived:    'badge-red',
  info:        'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
  draft:       'badge-slate',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

export function Badge({ className, variant = 'default', dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn('badge', variantMap[variant] ?? variantMap.default, className)}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" aria-hidden="true" />
      )}
      {children}
    </span>
  )
}
