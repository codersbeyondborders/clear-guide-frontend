'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover border-transparent shadow-sm',
  outline:
    'bg-transparent text-foreground border-border-strong hover:border-primary hover:text-primary hover:bg-primary-subtle',
  ghost:
    'bg-transparent text-muted-foreground border-transparent hover:bg-background-subtle hover:text-foreground',
  secondary:
    'bg-background-subtle text-foreground border-border hover:bg-card-hover',
  danger:
    'bg-destructive text-destructive-foreground border-transparent hover:opacity-90 shadow-sm',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm:   'h-8 px-3 text-xs rounded-md gap-1.5',
  md:   'h-10 px-4 text-sm rounded-lg gap-2',
  lg:   'h-11 px-6 text-sm rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-lg',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold border whitespace-nowrap',
        'transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
