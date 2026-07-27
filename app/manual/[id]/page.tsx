'use client'

import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import {
  BookOpen, FileText, LayoutGrid, Video, MessageSquare,
  Globe, ChevronDown, Download, Loader2, AlertCircle,
  ArrowRight, ChevronRight, Lock, Star, Users,
} from 'lucide-react'
import { useState } from 'react'
import { LANGUAGE_LABELS } from '@/components/ViewerHeader'
import { useEndUser } from '@/hooks/useEndUser'
import { ReviewsSection } from '@/components/community/ReviewsSection'
import { ForumSection } from '@/components/community/ForumSection'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ManualHubData {
  id: string
  productName: string
  productModel: string | null
  brand: string | null
  serialNumber: string | null
  description: string | null
  status: string
  languages: string[]
  coverImage: string | null
  sections: { id: string; title: string }[]
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------
const fetcher = (url: string) =>
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json() as Promise<ManualHubData>
  })

// ---------------------------------------------------------------------------
// Mode cards config
// ---------------------------------------------------------------------------
const MODES = [
  {
    id: 'text',
    label: 'Text & Images',
    description: 'Step-by-step instructions with inline photos. Best for detailed reading.',
    icon: FileText,
    recommended: true,
  },
  {
    id: 'infographic',
    label: 'Infographic',
    description: 'Visual overview of every section at a glance. Great for quick reference.',
    icon: LayoutGrid,
    recommended: false,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Watch guided walkthroughs for each section. Ideal for hands-on tasks.',
    icon: Video,
    recommended: false,
  },
  {
    id: 'chat',
    label: 'AI Chat',
    description: 'Ask any question and get instant answers sourced from this manual.',
    icon: MessageSquare,
    recommended: false,
  },
] as const

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------
function ClearGuideLogo() {
  return (
    <a
      href="/"
      className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      aria-label="ClearGuide home"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
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
      <span className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
        Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
      </span>
    </a>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ManualHubPage() {
  const router   = useRouter()
  const params   = useParams()
  const manualId = params.id as string

  const { data: manual, error, isLoading } = useSWR<ManualHubData>(
    manualId ? `/api/public/manuals/${manualId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const { user, isAuthenticated } = useEndUser()

  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [langOpen, setLangOpen]         = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [activeTab, setActiveTab]       = useState<'reviews' | 'discussion'>('reviews')

  const lang     = selectedLang ?? manual?.languages?.[0] ?? 'en'
  const langInfo = LANGUAGE_LABELS[lang] ?? { label: lang.toUpperCase(), flag: '🌐' }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
        role="status"
        aria-label="Loading manual"
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
          Loading manual…
        </p>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !manual) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5 p-8"
        style={{ backgroundColor: 'var(--color-background-subtle)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 12%, transparent)' }}
          aria-hidden="true"
        >
          <AlertCircle className="w-7 h-7" style={{ color: 'var(--color-destructive)' }} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold" style={{ color: 'var(--color-foreground)' }}>
            Manual not found
          </p>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {error?.message === '404'
              ? 'This manual is not yet published or does not exist.'
              : 'Something went wrong loading this manual.'}
          </p>
        </div>
        <button
          onClick={() => router.push('/user')}
          className="px-5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
        >
          Back to search
        </button>
      </div>
    )
  }

  const sectionCount = manual.sections?.length ?? 0

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <ClearGuideLogo />

          <div className="flex items-center gap-2">
            {/* Auth state */}
            {!isAuthenticated && (
              <a
                href={`/user/sign-in?returnTo=/manual/${manualId}`}
                className="hidden sm:inline-flex items-center h-8 px-3 rounded-xl border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}
              >
                Sign in
              </a>
            )}

            {/* Language picker */}
            {manual.languages.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setLangOpen(o => !o)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  aria-label={`Language: ${langInfo.label}`}
                >
                  <span aria-hidden="true">{langInfo.flag}</span>
                  <span className="hidden sm:inline text-xs">{langInfo.label}</span>
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                {langOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-xl z-30 overflow-hidden py-1"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                    role="listbox"
                    aria-label="Select language"
                  >
                    {manual.languages.map(l => {
                      const info    = LANGUAGE_LABELS[l] ?? { label: l.toUpperCase(), flag: '🌐' }
                      const isActive = lang === l
                      return (
                        <button
                          key={l}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => { setSelectedLang(l); setLangOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none"
                          style={{
                            color: isActive ? 'var(--color-primary)' : 'var(--color-foreground)',
                            backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <span aria-hidden="true">{info.flag}</span>
                          {info.label}
                          {isActive && (
                            <span
                              className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Download */}
            <div className="relative">
              <button
                onClick={() => setDownloadOpen(o => !o)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                aria-haspopup="menu"
                aria-expanded={downloadOpen}
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Save</span>
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              {downloadOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-xl z-30 overflow-hidden py-1"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  role="menu"
                >
                  {['PDF', 'DOCX', 'TXT'].map(fmt => (
                    <button
                      key={fmt}
                      role="menuitem"
                      onClick={() => setDownloadOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none hover:bg-background-subtle"
                      style={{ color: 'var(--color-foreground)' }}
                    >
                      Download as {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* ── Product Hero card ─────────────────────────────────────── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {/* Accent strip */}
          <div className="h-1.5 w-full" style={{ backgroundColor: 'var(--color-primary)' }} aria-hidden="true" />

          <div className="p-6 flex items-start gap-5">
            {/* Cover image / placeholder */}
            <div
              className="w-20 h-20 rounded-xl shrink-0 flex items-center justify-center border overflow-hidden"
              style={{
                backgroundColor: 'var(--color-primary-subtle)',
                borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
              }}
            >
              {manual.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={manual.coverImage}
                  alt={`${manual.productName} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="w-8 h-8" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2"
                style={{
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                }}
              >
                <BookOpen className="w-3 h-3" aria-hidden="true" />
                Product Manual
              </span>
              <h1
                className="text-xl font-bold tracking-tight text-balance leading-tight"
                style={{ color: 'var(--color-foreground)' }}
              >
                {manual.productName}
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                {[
                  manual.brand ? manual.brand : null,
                  manual.productModel ?? null,
                ].filter(Boolean).join(' — ')}
              </p>

              {/* Metadata chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {sectionCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-background-subtle)' }}
                  >
                    {sectionCount} section{sectionCount !== 1 ? 's' : ''}
                  </span>
                )}
                {manual.languages.length > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-background-subtle)' }}
                  >
                    <Globe className="w-3 h-3" aria-hidden="true" />
                    {manual.languages.length} language{manual.languages.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {manual.description && (
            <div
              className="px-6 pb-5 border-t pt-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p
                className="text-sm leading-relaxed text-pretty"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                {manual.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Language selector (multi-language) ────────────────────── */}
        {manual.languages.length > 1 && (
          <div
            className="rounded-2xl border p-4"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                Select your language
              </span>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Select language">
              {manual.languages.map(l => {
                const info     = LANGUAGE_LABELS[l] ?? { label: l.toUpperCase(), flag: '🌐' }
                const isActive = l === lang
                return (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-background-subtle)',
                      color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-foreground)',
                      borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                    aria-pressed={isActive}
                  >
                    <span aria-hidden="true">{info.flag}</span>
                    {info.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── View mode cards ───────────────────────────────────────── */}
        <section aria-labelledby="mode-heading">
          <div className="flex items-center justify-between mb-3">
            <h2
              id="mode-heading"
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Choose how to view
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map(mode => {
              const Icon = mode.icon
              const isLocked = mode.id === 'chat' && !isAuthenticated

              if (isLocked) {
                return (
                  <a
                    key={mode.id}
                    href={`/user/sign-up?returnTo=/manual/${manualId}`}
                    className="group relative flex items-start gap-4 p-5 rounded-2xl border text-left transition-all opacity-70 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                    aria-label="AI Chat — sign up to unlock"
                  >
                    <span
                      className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
                    >
                      <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                      Sign up
                    </span>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--color-background-subtle)' }}
                      aria-hidden="true"
                    >
                      <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <p className="text-sm font-bold" style={{ color: 'var(--color-muted-foreground)' }}>
                        AI Chat
                      </p>
                      <p className="text-xs mt-1 leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
                        Create a free account to ask questions and get instant answers from this manual.
                      </p>
                    </div>
                  </a>
                )
              }

              return (
                <button
                  key={mode.id}
                  onClick={() => router.push(`/manual/${manualId}/${mode.id}`)}
                  className="group relative flex items-start gap-4 p-5 rounded-2xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: mode.recommended ? 'var(--color-primary)' : 'var(--color-border)' }}
                  aria-label={`View as ${mode.label}`}
                >
                  {mode.recommended && (
                    <span
                      className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
                    >
                      Recommended
                    </span>
                  )}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{ backgroundColor: 'var(--color-primary-subtle)' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
                      {mode.label}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
                      {mode.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 shrink-0 mt-0.5 opacity-30 group-hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--color-foreground)' }}
                    aria-hidden="true"
                  />
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Quick jump — sections list ────────────────────────────── */}
        {sectionCount > 0 && (
          <section aria-labelledby="sections-heading">
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-3.5 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h2 id="sections-heading" className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  Sections in this manual
                </h2>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-background-subtle)', color: 'var(--color-muted-foreground)' }}
                >
                  {sectionCount}
                </span>
              </div>
              <ul role="list">
                {manual.sections.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => router.push(`/manual/${manualId}/text`)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-left transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      style={{
                        borderBottom: i < sectionCount - 1 ? `1px solid var(--color-border)` : 'none',
                        color: 'var(--color-foreground)',
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate font-medium">{s.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-30" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Community — Reviews & Discussion ─────────────────────── */}
        <section aria-labelledby="community-heading">
          <div className="flex items-center gap-2 mb-3">
            <h2
              id="community-heading"
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Community
            </h2>
          </div>

          {/* Tabs */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="flex border-b"
              style={{ borderColor: 'var(--color-border)' }}
              role="tablist"
              aria-label="Community tabs"
            >
              {([
                { id: 'reviews' as const,    label: 'Reviews',    Icon: Star },
                { id: 'discussion' as const, label: 'Discussion', Icon: Users },
              ]).map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    borderBottomColor: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                    backgroundColor: 'transparent',
                  }}
                >
                  <tab.Icon className="w-4 h-4" aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'reviews' && (
                <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews">
                  <ReviewsSection
                    manualId={manualId}
                    user={user}
                    currentPath={`/manual/${manualId}`}
                  />
                </div>
              )}
              {activeTab === 'discussion' && (
                <div id="panel-discussion" role="tabpanel" aria-labelledby="tab-discussion">
                  <ForumSection
                    manualId={manualId}
                    user={user}
                    currentPath={`/manual/${manualId}`}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-5 mt-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
      >
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Powered by <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>ClearGuide</span>
          </p>
          <a
            href="/user"
            className="text-xs font-medium underline-offset-2 hover:underline focus-visible:outline-none"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Find another manual
          </a>
        </div>
      </footer>

    </div>
  )
}
