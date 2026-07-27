'use client'

import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string | number
  trend?: number         // positive = up, negative = down, 0/undefined = flat
  unit?: string
  icon?: LucideIcon
  iconBg?: string        // CSS colour string for icon background
  iconColor?: string     // CSS colour string for icon itself
}

export function KPICard({ label, value, trend, unit, icon: Icon, iconBg, iconColor }: KPICardProps) {
  const trendColor =
    trend === undefined || trend === 0
      ? 'var(--color-muted-foreground)'
      : trend > 0
      ? 'var(--color-success)'
      : 'var(--color-destructive)'

  const TrendIcon =
    trend === undefined || trend === 0 ? Minus : trend > 0 ? TrendingUp : TrendingDown

  return (
    <div
      className="rounded-2xl border p-6 flex items-center gap-5"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Icon */}
      {Icon && (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg ?? 'var(--color-primary-subtle)' }}
          aria-hidden="true"
        >
          <Icon
            className="w-5 h-5"
            style={{ color: iconColor ?? 'var(--color-primary)' }}
          />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {label}
        </p>
        <p className="text-3xl font-bold mt-0.5 leading-none" style={{ color: 'var(--color-foreground)' }}>
          {value}
          {unit && (
            <span className="text-base font-medium ml-1" style={{ color: 'var(--color-muted-foreground)' }}>
              {unit}
            </span>
          )}
        </p>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 mt-1.5 text-xs font-semibold"
            style={{ color: trendColor }}
            aria-label={`${trend > 0 ? 'Up' : trend < 0 ? 'Down' : 'Flat'} ${Math.abs(trend)}% vs last month`}
          >
            <TrendIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {Math.abs(trend)}% vs last month
          </div>
        )}
      </div>
    </div>
  )
}
