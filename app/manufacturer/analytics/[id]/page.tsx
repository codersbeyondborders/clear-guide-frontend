'use client'

import { use, useState } from 'react'
import { ArrowLeft, Eye, Users, Clock, Download, Globe, Smartphone, Monitor, Tablet, MousePointer, MessageSquare, TrendingDown, UserCheck } from 'lucide-react'
import useSWR from 'swr'
import dynamic from 'next/dynamic'
import { KPICard } from '@/components/KPICard'

// ---------------------------------------------------------------------------
// Formatting Utils
// ---------------------------------------------------------------------------
function formatSecondsShort(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${String(s % 60).padStart(2, '0')}s`
}

// ---------------------------------------------------------------------------
// User Behaviour section
// ---------------------------------------------------------------------------
interface UserBehaviourProps {
  returningVsNew?: { returning: number; new: number }
  totalViews?: number
  activeUsers?: number
}

function UserBehaviourSection({ returningVsNew, totalViews = 0, activeUsers = 0 }: UserBehaviourProps) {
  const returning = returningVsNew?.returning ?? 0
  const newUsers  = returningVsNew?.new ?? (activeUsers - returning)
  const totalKnown = returning + newUsers

  const funnelSteps = [
    { label: 'Sessions', value: totalViews, icon: Eye },
    { label: 'Returning Users', value: returning, icon: UserCheck },
    { label: 'Used AI Chat', value: 0, icon: MessageSquare }, // Live tracking not implemented yet
    { label: 'Downloaded', value: 0, icon: Download },
  ]

  const bounceRate = 0 // Requires detailed session tracking
  const returningUserRate = totalKnown > 0 ? Math.round((returning / totalKnown) * 100) : 0

  const viewsByMode = { web: totalViews, ar: 0, qr: 0, direct: 0 }
  const mapTotalViews = totalViews || 1
  const modeLabels: Record<string, string> = { web: 'Web Viewer', ar: 'AR Overlay', qr: 'QR Scan', direct: 'Direct Link' }

  return (
    <section aria-labelledby="user-behaviour-heading" className="space-y-4">
      <h2 id="user-behaviour-heading" className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
        User Behaviour
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Engagement funnel */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Engagement Funnel</p>
          <div className="space-y-3">
            {funnelSteps.map((step, i) => {
              const pct = funnelSteps[0].value > 0 ? Math.round((step.value / funnelSteps[0].value) * 100) : 0
              const Icon = step.icon
              return (
                <div key={step.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                      <span style={{ color: 'var(--color-foreground)' }}>{step.label}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
                      {step.value.toLocaleString()} <span style={{ color: 'var(--color-muted-foreground)' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-background-subtle)' }}
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: i === 0 ? 'var(--color-primary)' : `color-mix(in srgb, var(--color-primary) ${100 - i * 18}%, transparent)`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-4 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Bounce Rate</p>
              <p className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>{bounceRate}%</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Returning</p>
              <p className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
                {returningUserRate}%
              </p>
            </div>
          </div>
        </div>

        {/* View mode breakdown */}
        <div
          className="rounded-2xl border p-5 space-y-4"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Access Mode Breakdown</p>
          <div className="space-y-3">
            {(Object.entries(viewsByMode) as [string, number][]).map(([mode, count]) => {
              const pct = Math.round((count / mapTotalViews) * 100)
              return (
                <div key={mode} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium" style={{ color: 'var(--color-foreground)' }}>{modeLabels[mode]}</span>
                    <span style={{ color: 'var(--color-muted-foreground)' }}>{count.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background-subtle)' }} aria-hidden="true">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Demographics section
// ---------------------------------------------------------------------------
interface DemographicsProps {
  countryData?: { country: string; views: number }[]
  deviceStats?: { mobile: number; desktop: number; tablet: number }
  topLanguages?: { language: string; views: number; percentage: number }[]
}

function DemographicsSection({ countryData, deviceStats, topLanguages }: DemographicsProps) {
  const dStats = deviceStats || { mobile: 0, desktop: 0, tablet: 0 }
  const deviceTotal = (dStats.mobile + dStats.desktop + dStats.tablet) || 1

  const countries = (countryData && countryData.length > 0)
    ? countryData.map((c, i) => ({
        country: c.country,
        flag: '',
        views: c.views,
        percentage: i === 0 ? 100 : Math.round((c.views / countryData[0].views) * 100),
      }))
    : []

  const languages = topLanguages || []

  return (
    <section aria-labelledby="demographics-heading" className="space-y-4">
      <h2 id="demographics-heading" className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
        Demographics
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Top countries */}
        <div
          className="rounded-2xl border p-5 space-y-3 sm:col-span-1"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Top Countries</p>
          <div className="space-y-2.5" role="list" aria-label="Top countries by views">
            {countries.length > 0 ? countries.map((c) => (
              <div key={c.country} role="listitem" className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--color-foreground)' }}>
                    <span aria-hidden="true">{c.flag}</span>
                    {c.country}
                  </span>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>{c.views.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background-subtle)' }} aria-hidden="true">
                  <div className="h-full rounded-full" style={{ width: `${c.percentage}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
              </div>
            )) : <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>No country data yet.</p>}
          </div>
        </div>

        {/* Device split */}
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Devices</p>
          <div className="space-y-3">
            {([
              { label: 'Mobile',  pct: dStats.mobile,  icon: Smartphone, color: 'var(--color-primary)' },
              { label: 'Desktop', pct: dStats.desktop, icon: Monitor,    color: '#0284c7' },
              { label: 'Tablet',  pct: dStats.tablet,  icon: Tablet,     color: '#d97706' },
            ] as { label: string; pct: number; icon: typeof Smartphone; color: string }[]).map(({ label, pct, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4" style={{ color }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--color-foreground)' }}>{label}</span>
                    <span className="font-semibold" style={{ color: 'var(--color-foreground)' }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background-subtle)' }} aria-hidden="true">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            100% of recorded sessions
          </p>
        </div>

        {/* Top languages */}
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Languages</p>
          <div className="space-y-2.5" role="list" aria-label="Top languages by views">
            {languages.length > 0 ? languages.map((l) => (
              <div key={l.language} role="listitem" className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                    <span style={{ color: 'var(--color-foreground)' }}>{l.language}</span>
                  </span>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>{l.percentage}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-background-subtle)' }} aria-hidden="true">
                  <div className="h-full rounded-full" style={{ width: `${l.percentage}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
              </div>
            )) : <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>No language data yet.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section Engagement table
// ---------------------------------------------------------------------------
interface SectionEngagementProps {
  sectionData?: { title: string; views: number; avgScrollDepth: number }[]
}

function SectionEngagementSection({ sectionData }: SectionEngagementProps) {
  const sectionEngagement = (sectionData && sectionData.length > 0)
    ? sectionData.map((s, i) => ({
        sectionNumber: i + 1,
        title: s.title,
        views: s.views,
        avgTimeSeconds: 0,
        dropoffRate: Math.max(0, 100 - s.avgScrollDepth),
      }))
    : []

  function dropoffColor(rate: number): string {
    if (rate < 20) return '#16a34a'
    if (rate < 50) return '#d97706'
    return 'var(--color-destructive)'
  }

  function dropoffBg(rate: number): string {
    if (rate < 20) return 'color-mix(in srgb, #16a34a 12%, transparent)'
    if (rate < 50) return 'color-mix(in srgb, #d97706 12%, transparent)'
    return 'color-mix(in srgb, var(--color-destructive) 12%, transparent)'
  }

  return (
    <section aria-labelledby="section-engagement-heading">
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 id="section-engagement-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
              Section Engagement
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
              Per-section views, time spent, and reader drop-off rates
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#16a34a' }} aria-hidden="true" />
              <span style={{ color: 'var(--color-muted-foreground)' }}>Low (&lt;20%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#d97706' }} aria-hidden="true" />
              <span style={{ color: 'var(--color-muted-foreground)' }}>Med (20–50%)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-destructive)' }} aria-hidden="true" />
              <span style={{ color: 'var(--color-muted-foreground)' }}>High (&gt;50%)</span>
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Section engagement breakdown">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['#', 'Section', 'Views', 'Avg Time', 'Drop-off'].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${h === '#' ? 'text-center' : 'text-left'}`}
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectionEngagement.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    No section engagement data yet.
                  </td>
                </tr>
              )}
              {sectionEngagement.map((s, i) => (
                <tr
                  key={s.sectionNumber}
                  style={{ borderBottom: i < sectionEngagement.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                >
                  <td className="px-6 py-3 text-center">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    >
                      {s.sectionNumber}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium" style={{ color: 'var(--color-foreground)' }}>
                    {s.title}
                  </td>
                  <td className="px-6 py-3 font-semibold" style={{ color: 'var(--color-foreground)' }}>
                    {s.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-3" style={{ color: 'var(--color-muted-foreground)' }}>
                    {formatSecondsShort(s.avgTimeSeconds)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: dropoffBg(s.dropoffRate), color: dropoffColor(s.dropoffRate) }}
                    >
                      <TrendingDown className="w-3 h-3" aria-hidden="true" />
                      {s.dropoffRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

type Period = '7d' | '30d' | '90d'
const PERIODS: { key: Period; label: string }[] = [
  { key: '7d',  label: '7d'  },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
]

// Recharts is ~350 KB — code-split it
const ViewsLineChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.ViewsLineChart),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> },
)
const TopQueriesBarChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.TopQueriesBarChart),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> },
)
const DevicePieChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.DevicePieChart),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> },
)
const AgeGroupBarChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.AgeGroupBarChart),
  { ssr: false, loading: () => <ChartSkeleton height={160} /> },
)
const CountryBarChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.CountryBarChart),
  { ssr: false, loading: () => <ChartSkeleton height={200} /> },
)
const EventBarChart = dynamic(
  () => import('@/components/AnalyticsCharts').then(m => m.EventBarChart),
  { ssr: false, loading: () => <ChartSkeleton height={180} /> },
)

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AnalyticsData {
  manualName?: string
  totalViews: number
  activeUsers: number
  avgTimeSpent: string
  trendViews: number
  trendUsers: number
  viewsOverTime: { date: string; views: number }[]
  topAIQueries: { query: string; count: number }[]
  // extended
  deviceBreakdown: { device: string; count: number }[]
  countryBreakdown: { country: string; views: number }[]
  ageGroupBreakdown: { group: string; count: number }[]
  eventBreakdown: { type: string; count: number }[]
  topSections: { title: string; views: number; avgScrollDepth: number }[]
  returningVsNew: { returning: number; new: number }
  deviceStats?: { mobile: number; desktop: number; tablet: number }
  topLanguages?: { language: string; views: number; percentage: number }[]
}

function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="rounded-lg animate-pulse"
      style={{ height, backgroundColor: 'var(--color-background-subtle)' }}
      aria-hidden="true"
    />
  )
}

function ClearGuideLogo() {
  return (
    <a href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label="ClearGuide home">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="4" rx="1" fill="white" opacity="0.7" />
          <rect x="2" y="11" width="14" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="14" width="10" height="2" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div className="leading-none hidden sm:block">
        <span className="block text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-sm font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </a>
  )
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [period, setPeriod] = useState<Period>('7d')

  const { data, isLoading, error } = useSWR<AnalyticsData>(
    `/api/manuals/${id}/analytics?period=${period}`,
    fetcher,
    { refreshInterval: 60_000 },
  )

  const totalAIQueries = data?.topAIQueries.reduce((s, q) => s + q.count, 0) ?? 0

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4 justify-between">
          {/* Left: back + logo + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/manufacturer/dashboard"
              className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </a>
            <ClearGuideLogo />
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
              <span aria-hidden="true" style={{ color: 'var(--color-muted-foreground)' }}>/</span>
              <a
                href="/manufacturer/dashboard"
                className="truncate focus-visible:outline-none focus-visible:underline"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                Dashboard
              </a>
              <span aria-hidden="true" style={{ color: 'var(--color-muted-foreground)' }}>/</span>
              <span className="font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
                {data?.manualName ?? (isLoading ? 'Loading…' : 'Analytics')}
              </span>
            </nav>
          </div>

          {/* Right: export */}
          <button
            type="button"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)',
              backgroundColor: 'var(--color-card)',
            }}
            onClick={() => {
              if (!data) return
              const rows: string[] = [
                `ClearGuide Analytics — ${data.manualName}`,
                `Exported: ${new Date().toLocaleString()}`,
                `Period: ${period}`,
                '',
                '=== KPI Summary ===',
                `Total Views,${data.totalViews}`,
                `Active Users,${data.activeUsers}`,
                `Avg Time Spent,${data.avgTimeSpent}`,
                `Views Trend,${data.trendViews}%`,
                `Users Trend,${data.trendUsers}%`,
                '',
                '=== Views Over Time ===',
                'Date,Views',
                ...data.viewsOverTime.map(r => `${r.date},${r.views}`),
                '',
                '=== Top AI Queries ===',
                'Query,Count',
                ...data.topAIQueries.map(r => `"${r.query.replace(/"/g, '""')}",${r.count}`),
              ]
              const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${data.manualName ?? 'analytics'}-${period}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            disabled={!data}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Error */}
        {error && (
          <div
            role="alert"
            className="px-4 py-3 rounded-xl border text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
              color: 'var(--color-destructive)',
              borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
            }}
          >
            Failed to load analytics. Please refresh.
          </div>
        )}

        {/* ── Page title + period switcher ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Analytics
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
              {data?.manualName
                ? `Performance overview for "${data.manualName}"`
                : 'Performance overview for this manual'}
              &nbsp;&mdash;&nbsp;auto-refreshes every minute
            </p>
          </div>

          {/* Period switcher */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-xl border self-start sm:self-auto shrink-0"
            style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
            role="group"
            aria-label="Time period"
          >
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                aria-pressed={period === key}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: period === key ? 'var(--color-card)' : 'transparent',
                  color: period === key ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                  boxShadow: period === key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── KPI cards ────────────────────────────────────────────────── */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">Key performance indicators</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border p-6 animate-pulse h-28"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  aria-hidden="true"
                />
              ))
            ) : data ? (
              <>
                <KPICard
                  label="Total Views"
                  value={data.totalViews.toLocaleString()}
                  trend={data.trendViews}
                  icon={Eye}
                  iconBg="color-mix(in srgb, #22c55e 15%, transparent)"
                  iconColor="#16a34a"
                />
                <KPICard
                  label="Active Users (30d)"
                  value={data.activeUsers.toLocaleString()}
                  trend={data.trendUsers}
                  icon={Users}
                  iconBg="color-mix(in srgb, #64748b 15%, transparent)"
                  iconColor="#475569"
                />
                <KPICard
                  label="Avg. Time Spent"
                  value={data.avgTimeSpent}
                  icon={Clock}
                  iconBg="color-mix(in srgb, #a855f7 15%, transparent)"
                  iconColor="#9333ea"
                />
                <KPICard
                  label="Returning Users"
                  value={
                    data.returningVsNew
                      ? `${data.returningVsNew.returning.toLocaleString()}`
                      : 'N/A'
                  }
                  icon={UserCheck}
                  iconBg="color-mix(in srgb, #d97706 15%, transparent)"
                  iconColor="#d97706"
                />
              </>
            ) : null}
          </div>
        </section>

        {/* ── Charts row ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Views over time */}
          <section
            aria-labelledby="views-chart-heading"
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 id="views-chart-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                Views Over Time
              </h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
              {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </p>
            {isLoading ? (
              <ChartSkeleton height={220} />
            ) : data ? (
              <ViewsLineChart data={data.viewsOverTime} />
            ) : null}
          </section>

          {/* Top AI queries */}
          <section
            aria-labelledby="queries-chart-heading"
            className="rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 id="queries-chart-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                Top AI Support Queries
              </h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
              Most asked questions in the last 30 days
            </p>
            {isLoading ? (
              <ChartSkeleton height={200} />
            ) : data?.topAIQueries?.length ? (
              <TopQueriesBarChart data={data.topAIQueries} />
            ) : (
              <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
                No AI queries recorded yet.
              </p>
            )}
          </section>
        </div>

        {/* ── AI query summary table ──────────────���────────────────────── */}
        {!isLoading && (data?.topAIQueries?.length ?? 0) > 0 && (
          <section aria-labelledby="query-table-heading">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h2 id="query-table-heading" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                  Query Breakdown
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
                  {totalAIQueries.toLocaleString()} total queries
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="AI query breakdown">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                        Query
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                        Count
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data!.topAIQueries.map((q, i) => {
                      const pct = totalAIQueries > 0 ? ((q.count / totalAIQueries) * 100).toFixed(1) : '0.0'
                      return (
                        <tr
                          key={i}
                          style={{ borderBottom: i < data!.topAIQueries.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                        >
                          <td className="px-6 py-3" style={{ color: 'var(--color-foreground)' }}>
                            {q.query}
                          </td>
                          <td className="px-6 py-3 text-right font-semibold" style={{ color: 'var(--color-foreground)' }}>
                            {q.count.toLocaleString()}
                          </td>
                          <td className="px-6 py-3 text-right" style={{ color: 'var(--color-muted-foreground)' }}>
                            {pct}%
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
        {/* ── User Behaviour ───────────────────────────────────────── */}
        <UserBehaviourSection
          returningVsNew={data?.returningVsNew}
          totalViews={data?.totalViews}
          activeUsers={data?.activeUsers}
        />

        {/* ── Device + Age demography ──────────────────────────────── */}
        <section aria-labelledby="device-age-heading" className="space-y-4">
          <h2 id="device-age-heading" className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
            Device & Age
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Device Breakdown</p>
              {isLoading ? (
                <ChartSkeleton height={200} />
              ) : (data?.deviceBreakdown?.length ?? 0) > 0 ? (
                <DevicePieChart data={data!.deviceBreakdown} />
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>No device data yet.</p>
              )}
            </div>
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Age Group Breakdown</p>
              {isLoading ? (
                <ChartSkeleton height={160} />
              ) : (data?.ageGroupBreakdown?.length ?? 0) > 0 ? (
                <AgeGroupBarChart data={data!.ageGroupBreakdown} />
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>No age data yet. Collected after users sign up with age group.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Demographics (countries + languages) ─────────────────── */}
        <DemographicsSection 
          countryData={data?.countryBreakdown} 
          deviceStats={data?.deviceStats} 
          topLanguages={data?.topLanguages} 
        />

        {/* ── Country chart + Event breakdown ──────────────────────── */}
        <section aria-labelledby="geo-events-heading" className="space-y-4">
          <h2 id="geo-events-heading" className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>
            Geography & Events
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Views by Country</p>
              {isLoading ? (
                <ChartSkeleton height={200} />
              ) : (data?.countryBreakdown?.length ?? 0) > 0 ? (
                <CountryBarChart data={data!.countryBreakdown} />
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>No country data yet.</p>
              )}
            </div>
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-foreground)' }}>Event Breakdown</p>
              {isLoading ? (
                <ChartSkeleton height={180} />
              ) : (data?.eventBreakdown?.length ?? 0) > 0 ? (
                <EventBarChart data={data!.eventBreakdown} />
              ) : (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-muted-foreground)' }}>No event data yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Section Engagement ───────────────────────────────────── */}
        <SectionEngagementSection sectionData={data?.topSections} />
      </main>
    </div>
  )
}
