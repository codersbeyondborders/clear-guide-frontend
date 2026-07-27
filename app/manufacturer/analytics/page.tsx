'use client'

import { useRouter } from 'next/navigation'
import {
  Eye, Users, MessageSquare, TrendingUp, TrendingDown, Minus,
  ArrowUpRight, BarChart2, AlertTriangle, Timer, TrendingDown as BounceIcon,
} from 'lucide-react'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

const ViewsLineChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.ViewsLineChart),
  { ssr: false, loading: () => <div className="h-52 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-background-subtle)' }} /> },
)

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OverviewKPI {
  totalViews: number
  activeUsers: number
  aiQueries: number
  trendViews: number
  trendUsers: number
}

interface TopManual {
  id: string
  name: string
  status: string
  views: number
  users: number
  avgSeconds: number
}

interface OverviewData {
  kpi: OverviewKPI
  viewsOverTime: { date: string; views: number }[]
  topManuals: TopManual[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatSeconds(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${String(s % 60).padStart(2, '0')}s`
}

// ---------------------------------------------------------------------------
// Trend badge
// ---------------------------------------------------------------------------
function TrendBadge({ trend }: { trend: number }) {
  const isUp   = trend > 0
  const isDown = trend < 0
  const Icon   = isUp ? TrendingUp : isDown ? TrendingDown : Minus
  const color  = isUp
    ? 'var(--color-success, #16a34a)'
    : isDown
    ? 'var(--color-destructive)'
    : 'var(--color-muted-foreground)'

  return (
    <span
      className="flex items-center gap-0.5 text-[10px] font-semibold"
      style={{ color }}
      aria-label={`${isUp ? 'Up' : isDown ? 'Down' : 'Flat'} ${Math.abs(trend)}% vs last 30 days`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {Math.abs(trend)}%
    </span>
  )
}

// ---------------------------------------------------------------------------
// KPI card
// ---------------------------------------------------------------------------
function KPISummaryCard({
  label, value, icon: Icon, iconBg, iconColor, trend,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: number
}) {
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
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5 leading-none" style={{ color: 'var(--color-foreground)' }}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
        {trend !== undefined && (
          <div className="mt-1.5 flex items-center gap-1">
            <TrendBadge trend={trend} />
            <span className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>vs last 30d</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function CardSkeleton() {
  return (
    <div
      className="rounded-2xl border p-5 flex items-start gap-4 animate-pulse"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      <div className="space-y-2 pt-1 flex-1">
        <div className="h-3 w-24 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        <div className="h-6 w-16 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  published:      { label: 'Published',      bg: 'var(--color-primary-subtle)',                          color: 'var(--color-primary)'          },
  pending_review: { label: 'Pending Review', bg: 'color-mix(in srgb, #f59e0b 12%, transparent)',          color: '#d97706'                        },
  draft:          { label: 'Draft',          bg: 'color-mix(in srgb, #d97706 10%, transparent)',          color: '#d97706'                        },
  processing:     { label: 'Processing',     bg: 'color-mix(in srgb, #0284c7 10%, transparent)',          color: '#0284c7'                        },
  archived:       { label: 'Archived',       bg: 'var(--color-background-subtle)',                        color: 'var(--color-muted-foreground)'  },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AnalyticsOverviewPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()
  const { data, isLoading, error } = useSWR<OverviewData>('/api/analytics/overview', fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  })

  const displayName: string = (
    user?.displayName ??
    user?.email ??
    'Manufacturer'
  ) as string

  const initials = displayName
    .split(/[\s@]/).filter(Boolean)
    .map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'MF'

  return (
    <DashboardShell displayName={displayName} initials={initials} onLogout={logout}>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance" style={{ color: 'var(--color-foreground)' }}>
          Analytics
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
          Aggregate performance across all your manuals &mdash; auto-refreshes every minute
        </p>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm mb-6"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
            color: 'var(--color-destructive)',
            borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          Failed to load analytics. Please refresh.
        </div>
      )}

      {/* ── KPI cards ──────────��─────────────────────────────────────────── */}
      <section aria-labelledby="overview-kpi-heading" className="mb-7">
        <h2 id="overview-kpi-heading" className="sr-only">Key performance indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          ) : data ? (
            <>
              <KPISummaryCard
                label="Total Views"
                value={data.kpi.totalViews}
                icon={Eye}
                iconBg="color-mix(in srgb, #0284c7 12%, transparent)"
                iconColor="#0284c7"
                trend={data.kpi.trendViews}
              />
              <KPISummaryCard
                label="Active Users (30d)"
                value={data.kpi.activeUsers}
                icon={Users}
                iconBg="color-mix(in srgb, #d97706 12%, transparent)"
                iconColor="#d97706"
                trend={data.kpi.trendUsers}
              />
              <KPISummaryCard
                label="AI Queries"
                value={data.kpi.aiQueries}
                icon={MessageSquare}
                iconBg="var(--color-primary-subtle)"
                iconColor="var(--color-primary)"
              />
              <KPISummaryCard
                label="Avg. Session"
                value="4m 12s"
                icon={Timer}
                iconBg="color-mix(in srgb, #a855f7 12%, transparent)"
                iconColor="#9333ea"
              />
              <KPISummaryCard
                label="Bounce Rate"
                value="24%"
                icon={BounceIcon}
                iconBg="color-mix(in srgb, #ef4444 10%, transparent)"
                iconColor="#dc2626"
              />
            </>
          ) : null}
        </div>
      </section>

      {/* ── Charts + table row ───────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Views over time — takes 2/3 width */}
        <section
          aria-labelledby="views-chart-heading"
          className="lg:col-span-2 rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <h2 id="views-chart-heading" className="text-base font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
            Views Over Time
          </h2>
          <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            All manuals combined — last 30 days
          </p>
          {isLoading ? (
            <div className="h-52 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
          ) : (data?.viewsOverTime?.length ?? 0) > 0 ? (
            <ViewsLineChart data={data!.viewsOverTime} />
          ) : (
            <p className="text-sm py-14 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
              No view data for the last 30 days.
            </p>
          )}
        </section>

        {/* Top manuals mini-list — 1/3 width */}
        <section
          aria-labelledby="top-manuals-heading"
          className="rounded-2xl border overflow-hidden flex flex-col"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <h2 id="top-manuals-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
              Top Manuals
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
              Ranked by total views
            </p>
          </div>

          <div className="flex-1 divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
                    <div className="h-2.5 w-1/2 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
                  </div>
                </div>
              ))
            ) : (data?.topManuals?.length ?? 0) === 0 ? (
              <div className="py-10 text-center">
                <BarChart2 className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-border)' }} aria-hidden="true" />
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                  No manuals yet. Create one to see stats here.
                </p>
              </div>
            ) : (
              data!.topManuals.map((m, i) => {
                const statusCfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.draft
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => router.push(`/manufacturer/analytics/${m.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-background-subtle)' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    aria-label={`View analytics for ${m.name}`}
                  >
                    {/* Rank */}
                    <span
                      className="text-xs font-bold w-5 text-center shrink-0"
                      style={{ color: i === 0 ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>

                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
                        {m.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                        >
                          {statusCfg.label}
                        </span>
                        {m.avgSeconds > 0 && (
                          <span className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
                            {formatSeconds(m.avgSeconds)} avg
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Views count + link icon */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>
                        {formatNumber(m.views)}
                      </span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 opacity-40"
                        style={{ color: 'var(--color-muted-foreground)' }}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* ── Full top manuals table ───────────────────────────────────────── */}
      {!isLoading && (data?.topManuals?.length ?? 0) > 0 && (
        <section aria-labelledby="top-manuals-table-heading" className="mt-6">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 id="top-manuals-table-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                All Manuals — Performance Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Manuals performance breakdown">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Manual', 'Status', 'Total Views', 'Unique Users', 'Avg. Time', ''].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${h === '' ? 'text-right' : 'text-left'}`}
                        style={{ color: 'var(--color-muted-foreground)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data!.topManuals.map((m, i) => {
                    const statusCfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.draft
                    return (
                      <tr
                        key={m.id}
                        style={{ borderBottom: i < data!.topManuals.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--color-foreground)' }}>
                            {m.name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold" style={{ color: 'var(--color-foreground)' }}>
                          {m.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--color-muted-foreground)' }}>
                          {m.users.toLocaleString()}
                        </td>
                        <td className="px-6 py-4" style={{ color: 'var(--color-muted-foreground)' }}>
                          {m.avgSeconds > 0 ? formatSeconds(m.avgSeconds) : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => router.push(`/manufacturer/analytics/${m.id}`)}
                            className="inline-flex items-center gap-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            View details
                            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </DashboardShell>
  )
}
