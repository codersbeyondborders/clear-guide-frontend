'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

const SIZE_MAP = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }

export function StarRating({ value, onChange, size = 'md', readOnly = false }: StarRatingProps) {
  const sz = SIZE_MAP[size]

  return (
    <div
      className="flex items-center gap-0.5"
      role={readOnly ? 'img' : 'group'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= value
        return readOnly ? (
          <Star
            key={star}
            className={sz}
            aria-hidden="true"
            style={{
              color: filled ? '#f59e0b' : 'var(--color-border)',
              fill: filled ? '#f59e0b' : 'none',
            }}
          />
        ) : (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={star === value}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={sz}
              style={{
                color: filled ? '#f59e0b' : 'var(--color-border)',
                fill: filled ? '#f59e0b' : 'none',
                transition: 'color 0.1s, fill 0.1s',
              }}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
