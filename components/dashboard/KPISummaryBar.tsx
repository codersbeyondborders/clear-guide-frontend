'use client'

import { BookMarked, CheckCircle2, Eye, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DashboardKPI } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ---------------------------------------------------------------------------
// Trend badge
// ---------------------------------------------------------------------------
function TrendBadge({ trend }: { trend: number }) {
  const isUp   = trend > 0
  const isDown = trend < 0
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus

  const color = isUp
    ? 'var(--color-success, #16a34a)'
    : isDown
    ? 'var(--color-destructive)'
    : 'var(--color-muted-foreground)'

  return (
    <span
      className="flex items-center gap-1 text-[10px] font-semibold mt-1.5"
      style={{ color }}
      aria-label={`${isUp ? 'Up' : isDown ? 'Down' : 'Flat'} ${Math.abs(trend)}% vs last 30 days`}
    >
      <TrendIcon className="w-3 h-3" aria-hidden="true" />
      {Math.abs(trend)}% vs last 30d
    </span>
  )
}

// ---------------------------------------------------------------------------
// Single KPI card
// ---------------------------------------------------------------------------
interface KPICardProps {
  label: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  subLabel?: string
  trend?: number
}

function KPICard({ label, value, icon: Icon, iconBg, iconColor, subLabel, trend }: KPICardProps) {
  return (
    <div
      className="rounded-2xl border p-5 flex items-start gap-4"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-muted-foreground)' }}>
          {label}
        </p>
        <p className="text-2xl font-bold tracking-tight leading-none" style={{ color: 'var(--color-foreground)' }}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
        {subLabel && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {subLabel}
          </p>
        )}
        {trend !== undefined && <TrendBadge trend={trend} />}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function KPICardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5 flex items-start gap-4 animate-pulse"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-20 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="h-6 w-12 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface KPISummaryBarProps {
  kpi: DashboardKPI | null
  isLoading: boolean
}

// ---------------------------------------------------------------------------
// Bar
// ---------------------------------------------------------------------------
export function KPISummaryBar({ kpi, isLoading }: KPISummaryBarProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        aria-busy="true"
        aria-label="Loading KPI summary"
      >
        {Array.from({ length: 4 }).map((_, i) => <KPICardSkeleton key={i} />)}
      </div>
    )
  }

  const cards: KPICardProps[] = [
    {
      label: 'Total Manuals',
      value: kpi?.totalManuals ?? 0,
      icon: BookMarked,
      iconBg: 'var(--color-primary-subtle)',
      iconColor: 'var(--color-primary)',
    },
    {
      label: 'Published',
      value: kpi?.publishedManuals ?? 0,
      icon: CheckCircle2,
      iconBg: 'color-mix(in srgb, #16a34a 12%, transparent)',
      iconColor: '#16a34a',
      subLabel: kpi && kpi.totalManuals > 0
        ? `${Math.round((kpi.publishedManuals / kpi.totalManuals) * 100)}% of total`
        : undefined,
    },
    {
      label: 'Total Views',
      value: kpi?.totalViews ?? 0,
      icon: Eye,
      iconBg: 'color-mix(in srgb, #0284c7 12%, transparent)',
      iconColor: '#0284c7',
      trend: kpi?.trendViews,
    },
    {
      label: 'Active Users',
      value: kpi?.activeUsers ?? 0,
      icon: Users,
      iconBg: 'color-mix(in srgb, #d97706 12%, transparent)',
      iconColor: '#d97706',
      subLabel: 'Last 30 days',
      trend: kpi?.trendUsers,
    },
  ]

  return (
    <section aria-label="Key performance indicators">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <KPICard key={card.label} {...card} />
        ))}
      </div>
    </section>
  )
}
