'use client'

import { useState, useMemo, useId, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, AlertTriangle, Search, X, ChevronDown, LayoutGrid, List } from 'lucide-react'
import { ManualCard } from '@/components/ManualCard'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { KPISummaryBar } from '@/components/dashboard/KPISummaryBar'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { useManuals } from '@/hooks/useManuals'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics'
import type { ManualListItem, ManualStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type SortKey = 'newest' | 'oldest' | 'name-asc' | 'most-viewed'
type StatusFilter = 'all' | ManualStatus

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all',            label: 'All'            },
  { key: 'published',      label: 'Published'      },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'draft',          label: 'Draft'          },
  { key: 'processing',     label: 'Processing'     },
]

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest',     label: 'Newest first'   },
  { key: 'oldest',     label: 'Oldest first'   },
  { key: 'name-asc',   label: 'Name A–Z'       },
  { key: 'most-viewed',label: 'Most viewed'    },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function filterAndSort(
  manuals: ManualListItem[],
  query: string,
  status: StatusFilter,
  sort: SortKey,
): ManualListItem[] {
  let list = [...manuals]

  // Status filter
  if (status !== 'all') {
    list = list.filter((m) => m.status === status)
  }

  // Search filter (name, model, brand)
  if (query.trim()) {
    const q = query.toLowerCase()
    list = list.filter(
      (m) =>
        m.productName.toLowerCase().includes(q) ||
        (m.productModel ?? '').toLowerCase().includes(q) ||
        (m.brand ?? '').toLowerCase().includes(q),
    )
  }

  // Sort
  switch (sort) {
    case 'oldest':
      list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      break
    case 'name-asc':
      list.sort((a, b) => a.productName.localeCompare(b.productName))
      break
    case 'most-viewed':
      list.sort((a, b) => b.viewCount - a.viewCount)
      break
    default: // newest
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  return list
}

// ---------------------------------------------------------------------------
// Delete modal
// ---------------------------------------------------------------------------
function DeleteModal({ manualName, onConfirm, onCancel }: {
  manualName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border p-6 space-y-5 shadow-xl"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)' }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-destructive)' }} aria-hidden="true" />
        </div>
        <div className="text-center space-y-1.5">
          <h2 id="delete-modal-title" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
            Delete manual?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            <strong style={{ color: 'var(--color-foreground)' }}>{manualName}</strong> will be
            permanently removed and cannot be recovered.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Card skeleton
// ---------------------------------------------------------------------------
function ManualCardSkeleton() {
  return (
    <div
      className="rounded-2xl border flex flex-col overflow-hidden animate-pulse"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* thumbnail */}
      <div className="w-full h-36" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
          <div className="h-3 w-1/2 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        </div>
        <div className="flex gap-2">
          <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
          <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        </div>
        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
          <div className="flex-1 h-8 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
          <div className="w-9 h-8 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
          <div className="w-9 h-8 rounded-full" style={{ backgroundColor: 'var(--color-background-subtle)' }} />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export default function ManufacturerDashboard() {
  const router = useRouter()
  const searchId = useId()
  const sortId = useId()

  const { user, isLoading: authLoading, logout } = useAuth()
  const { manuals, isLoading: manualsLoading, isError: manualsError, deleteManual, mutate: retryManuals } = useManuals()
  const { kpi, recentActivity, isLoading: analyticsLoading, isError: analyticsError, retry: retryAnalytics } = useDashboardAnalytics()

  // ── Local UI state ────────────────────────────────────────────────────────
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Persist view mode preference
  useEffect(() => {
    const saved = localStorage.getItem('manuals-view-mode')
    if (saved === 'list' || saved === 'grid') setViewMode(saved)
  }, [])

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('manuals-view-mode', mode)
  }

  // ── Derived display name ──────────────────────────────────────────────────
  const displayName: string = (
    user?.displayName ??
    user?.email ??
    'Manufacturer'
  ) as string

  const initials = displayName
    .split(/[\s@]/)
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'MF'

  // ── Filtered + sorted manuals ─────────────────────────────────────────────
  const filteredManuals = useMemo(
    () => filterAndSort(manuals, searchQuery, statusFilter, sortKey),
    [manuals, searchQuery, statusFilter, sortKey],
  )

  // ── Tab counts ────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    return {
      all:            manuals.length,
      published:      manuals.filter((m) => m.status === 'published').length,
      pending_review: manuals.filter((m) => m.status === 'pending_review').length,
      draft:          manuals.filter((m) => m.status === 'draft').length,
      processing:     manuals.filter((m) => m.status === 'processing').length,
    }
  }, [manuals])

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteRequest = (id: string) => {
    const m = manuals.find((m) => m.id === id)
    if (m) setPendingDelete({ id, name: m.productName })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    await deleteManual(pendingDelete.id)
    setPendingDelete(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <DashboardShell
        displayName={displayName}
        initials={initials}
        onLogout={logout}
      >
        {/* ── Page header ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-balance"
              style={{ color: 'var(--color-foreground)' }}
            >
              {authLoading ? 'Dashboard' : `Welcome back${user ? `, ${displayName.split(/[\s@]/)[0]}` : ''}`}
            </h1>
            <p className="text-sm mt-1 text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
              Manage and monitor all your digital product manuals.
            </p>
          </div>
          <button
            onClick={() => router.push('/manufacturer/new')}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            aria-label="Create a new manual"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Create Manual
          </button>
        </div>

        {/* ── KPI bar ────────────────────────────────────────────────────── */}
        <div className="mb-7">
          <KPISummaryBar
            kpi={kpi}
            isLoading={analyticsLoading}
          />
          {analyticsError && (
            <p
              className="text-xs mt-2 flex items-center gap-1.5"
              style={{ color: 'var(--color-destructive)' }}
              role="alert"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Could not load analytics summary.{' '}
              <button
                type="button"
                onClick={retryAnalytics}
                className="underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Retry
              </button>
            </p>
          )}
        </div>

        {/* ── Main content: grid + activity feed ─────────────────────────── */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* Left: manuals grid */}
          <div className="flex-1 min-w-0">

            {/* Search + Sort + View toggle row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Search input */}
              <div className="relative flex-1">
                <label htmlFor={searchId} className="sr-only">Search manuals</label>
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  aria-hidden="true"
                />
                <input
                  id={searchId}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, model or brand…"
                  className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)',
                  }}
                  aria-live="polite"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ color: 'var(--color-muted-foreground)' }}
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <label htmlFor={sortId} className="sr-only">Sort manuals</label>
                <select
                  id={sortId}
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)',
                    minWidth: '148px',
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  aria-hidden="true"
                />
              </div>

              {/* View mode toggle */}
              <div
                className="flex items-center gap-0.5 p-0.5 rounded-xl border shrink-0"
                style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
                role="group"
                aria-label="View mode"
              >
                {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleSetViewMode(mode)}
                    aria-pressed={viewMode === mode}
                    aria-label={`${mode} view`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: viewMode === mode ? 'var(--color-card)' : 'transparent',
                      color: viewMode === mode ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                      boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            {/* Status tabs */}
            <div
              className="flex items-center gap-1 mb-5 p-1 rounded-xl border w-fit flex-wrap"
              style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
              role="tablist"
              aria-label="Filter by status"
            >
              {STATUS_TABS.map(({ key, label }) => {
                const isActive = statusFilter === key
                const count = tabCounts[key]
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStatusFilter(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: isActive ? 'var(--color-card)' : 'transparent',
                      color: isActive ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {label}
                    {!manualsLoading && (
                      <span
                        className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'var(--color-border)',
                          color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Error state */}
            {manualsError && (
              <div
                role="alert"
                className="px-4 py-3 rounded-xl border text-sm flex items-center justify-between gap-3 mb-5"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                  color: 'var(--color-destructive)',
                  borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
                }}
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Failed to load manuals. This is usually a temporary connection issue.
                </span>
                <button
                  type="button"
                  onClick={() => retryManuals()}
                  className="shrink-0 text-xs font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {manualsLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-5" aria-busy="true" aria-label="Loading manuals">
                {Array.from({ length: 6 }).map((_, i) => <ManualCardSkeleton key={i} />)}
              </div>
            )}

            {/* Empty — no manuals at all */}
            {!manualsLoading && !manualsError && manuals.length === 0 && (
              <div
                className="text-center py-20 rounded-2xl border"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                  aria-hidden="true"
                >
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <rect x="4" y="3" width="12" height="16" rx="2" stroke="var(--color-primary)" strokeWidth="1.5" />
                    <path d="M8 8h8M8 11h6M8 14h4" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="20" cy="20" r="6" fill="var(--color-primary)" />
                    <path d="M20 17v6M17 20h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                  No manuals yet
                </h2>
                <p className="text-sm mb-6 max-w-xs mx-auto text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
                  Create your first accessible digital product manual and start engaging your customers.
                </p>
                <button
                  onClick={() => router.push('/manufacturer/new')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Create Your First Manual
                </button>
              </div>
            )}

            {/* Empty search/filter result */}
            {!manualsLoading && !manualsError && manuals.length > 0 && filteredManuals.length === 0 && (
              <div
                className="text-center py-14 rounded-2xl border"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
              >
                <Search className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-border)' }} aria-hidden="true" />
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>
                  No manuals match your filters
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
                  Try a different search term or status filter.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                  className="text-xs font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Manual grid / list */}
            {!manualsLoading && !manualsError && filteredManuals.length > 0 && (
              <section aria-label={`Manuals list — ${filteredManuals.length} result${filteredManuals.length !== 1 ? 's' : ''}`}>
                {/* Live region announces filter result count */}
                <p className="sr-only" aria-live="polite" aria-atomic="true">
                  {filteredManuals.length} manual{filteredManuals.length !== 1 ? 's' : ''} found.
                </p>
                {viewMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                    {filteredManuals.map((manual) => (
                      <ManualCard key={manual.id} manual={manual} onDelete={handleDeleteRequest} />
                    ))}
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border overflow-hidden"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  >
                    {filteredManuals.map((manual) => (
                      <ManualCard key={manual.id} manual={manual} onDelete={handleDeleteRequest} listMode />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right: activity feed */}
          <aside
            className="xl:w-80 shrink-0"
            aria-label="Recent activity sidebar"
          >
            <ActivityFeed
              events={recentActivity}
              isLoading={analyticsLoading}
            />
          </aside>
        </div>
      </DashboardShell>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <DeleteModal
          manualName={pendingDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  )
}
