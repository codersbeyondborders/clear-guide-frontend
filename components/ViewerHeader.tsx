'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ZoomIn, ZoomOut, Info, Download, Volume2, VolumeX,
  ChevronDown, X, BookOpen, Tag, Globe, Hash, Contrast,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'
import { ThemeToggle } from '@/components/ThemeToggle'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ManualInfo {
  productName: string
  productModel?: string | null
  brand?: string | null
  serialNumber?: string | null
  languages: string[]
  sectionCount?: number
}

interface ViewerHeaderProps {
  manualInfo: ManualInfo
  manualId: string
  selectedLang: string
  onLangChange: (lang: string) => void
  plainText?: string
  muted?: boolean
  onToggleMute?: () => void
  showMute?: boolean
}

// ---------------------------------------------------------------------------
// Shared language table
// ---------------------------------------------------------------------------
export const LANGUAGE_LABELS: Record<string, { label: string; flag: string }> = {
  en: { label: 'English',    flag: '🇬🇧' },
  fr: { label: 'French',     flag: '🇫🇷' },
  de: { label: 'German',     flag: '🇩🇪' },
  es: { label: 'Spanish',    flag: '🇪🇸' },
  it: { label: 'Italian',    flag: '🇮🇹' },
  pt: { label: 'Portuguese', flag: '🇵🇹' },
  nl: { label: 'Dutch',      flag: '🇳🇱' },
  pl: { label: 'Polish',     flag: '🇵🇱' },
  ru: { label: 'Russian',    flag: '🇷🇺' },
  zh: { label: 'Chinese',    flag: '🇨🇳' },
  ja: { label: 'Japanese',   flag: '🇯🇵' },
  ko: { label: 'Korean',     flag: '🇰🇷' },
  ar: { label: 'Arabic',     flag: '🇸🇦' },
  hi: { label: 'Hindi',      flag: '🇮🇳' },
  tr: { label: 'Turkish',    flag: '🇹🇷' },
  sv: { label: 'Swedish',    flag: '🇸🇪' },
}

// ---------------------------------------------------------------------------
// Logo (inline — no separate import needed)
// ---------------------------------------------------------------------------
function ClearGuideLogo() {
  return (
    <a
      href="/"
      className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded shrink-0"
      aria-label="ClearGuide home"
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="4" rx="1" fill="white" opacity="0.7" />
          <rect x="2" y="11" width="14" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="14" width="10" height="2" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <span className="hidden sm:block text-sm font-bold leading-none" style={{ color: 'var(--color-foreground)' }}>
        Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
      </span>
    </a>
  )
}

// ---------------------------------------------------------------------------
// Info drawer
// ---------------------------------------------------------------------------
function InfoDrawer({
  info,
  open,
  onClose,
}: {
  info: ManualInfo
  open: boolean
  onClose: () => void
}) {
  const drawerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const el = drawerRef.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable[0]?.focus()
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const rows: { icon: typeof BookOpen; label: string; value: string | null | undefined }[] = [
    { icon: BookOpen, label: 'Product',   value: info.productName },
    { icon: Tag,      label: 'Brand',     value: info.brand },
    { icon: Globe,    label: 'Model',     value: info.productModel },
    { icon: Hash,     label: 'Serial',    value: info.serialNumber },
    {
      icon: Globe,
      label: 'Languages',
      value: info.languages.map(l => LANGUAGE_LABELS[l]?.label ?? l.toUpperCase()).join(', '),
    },
  ].filter(r => r.value)

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Product information"
        id="info-drawer"
        className="fixed bottom-0 left-0 right-0 z-50 sm:left-auto sm:right-4 sm:bottom-auto sm:top-16 sm:w-80 rounded-t-3xl sm:rounded-2xl border shadow-2xl"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Handle bar (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
            Product Information
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="Close product information"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <dl className="px-5 py-4 space-y-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <dt className="flex items-center gap-2 w-24 shrink-0">
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>
                  {label}
                </span>
              </dt>
              <dd className="text-sm font-medium text-pretty flex-1" style={{ color: 'var(--color-foreground)' }}>
                {value}
              </dd>
            </div>
          ))}
          {info.sectionCount != null && info.sectionCount > 0 && (
            <div className="flex items-start gap-3">
              <dt className="flex items-center gap-2 w-24 shrink-0">
                <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>Sections</span>
              </dt>
              <dd className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                {info.sectionCount}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Toolbar icon button helper
// ---------------------------------------------------------------------------
function ToolBtn({
  onClick,
  label,
  pressed,
  active,
  disabled,
  children,
}: {
  onClick: () => void
  label: string
  pressed?: boolean
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        color: active ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
        backgroundColor: active ? 'var(--color-primary-subtle)' : 'var(--color-card)',
      }}
      aria-label={label}
      aria-pressed={pressed}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ViewerHeader({
  manualInfo,
  manualId,
  selectedLang,
  onLangChange,
  plainText,
  muted = false,
  onToggleMute,
  showMute = false,
}: ViewerHeaderProps) {
  const router = useRouter()
  const [langOpen,     setLangOpen]     = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [infoOpen,     setInfoOpen]     = useState(false)

  const { increaseFontSize, decreaseFontSize, fontSize, toggleHighContrast, highContrast } =
    useAccessibility()

  const langInfo = LANGUAGE_LABELS[selectedLang] ?? { label: selectedLang.toUpperCase(), flag: '🌐' }

  const FONT_LABELS: Record<string, string> = { sm: 'Small', md: 'Normal', lg: 'Large', xl: 'X-Large' }

  // Close dropdowns on outside click
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setLangOpen(false)
        setDownloadOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDownload = (format: 'txt' | 'json') => {
    setDownloadOpen(false)
    const content =
      format === 'json'
        ? JSON.stringify({ id: manualId, ...manualInfo }, null, 2)
        : plainText ?? manualInfo.productName
    const mime = format === 'json' ? 'application/json' : 'text/plain;charset=utf-8'
    const blob = new Blob([content], { type: mime })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${manualInfo.productName ?? 'manual'}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <header
        ref={headerRef}
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="w-full px-3 h-14 flex items-center gap-2">

          {/* Back button */}
          <button
            onClick={() => router.push(`/manual/${manualId}`)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}
            aria-label="Back to manual overview"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Logo */}
          <ClearGuideLogo />

          {/* Divider + product breadcrumb */}
          <div className="flex items-center gap-1.5 min-w-0 mx-1">
            <span className="text-slate-300 select-none" aria-hidden="true">/</span>
            <span
              className="text-sm font-medium truncate max-w-[160px] sm:max-w-xs"
              style={{ color: 'var(--color-foreground)' }}
            >
              {manualInfo.productName}
            </span>
          </div>

          <div className="flex-1" />

          {/* ── Toolbar ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Mute (TTS only) */}
            {showMute && onToggleMute && (
              <ToolBtn
                onClick={onToggleMute}
                label={muted ? 'Unmute audio' : 'Mute audio'}
                pressed={muted}
                active={!muted}
              >
                {muted
                  ? <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                  : <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                }
              </ToolBtn>
            )}

            {/* Font size group — visible on sm+ */}
            <div className="hidden sm:flex items-center gap-0.5 px-1 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={decreaseFontSize}
                disabled={fontSize === 'sm'}
                className="w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-label={`Decrease font size (current: ${FONT_LABELS[fontSize]})`}
              >
                <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="text-[10px] font-semibold w-5 text-center select-none" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true">
                A
              </span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                className="w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-label={`Increase font size (current: ${FONT_LABELS[fontSize]})`}
              >
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {/* High contrast */}
            <ToolBtn
              onClick={toggleHighContrast}
              label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
              pressed={highContrast}
              active={highContrast}
            >
              <Contrast className="w-3.5 h-3.5" aria-hidden="true" />
            </ToolBtn>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Info */}
            <ToolBtn
              onClick={() => setInfoOpen(o => !o)}
              label="Product information"
              pressed={infoOpen}
              active={infoOpen}
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </ToolBtn>

            {/* Language picker */}
            {manualInfo.languages.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setLangOpen(o => !o)}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  aria-label={`Language: ${langInfo.label}`}
                >
                  <span aria-hidden="true">{langInfo.flag}</span>
                  <ChevronDown className="w-3 h-3" aria-hidden="true" />
                </button>
                {langOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-xl z-30 overflow-hidden py-1"
                    style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                    role="listbox"
                    aria-label="Select language"
                  >
                    {manualInfo.languages.map(lang => {
                      const info     = LANGUAGE_LABELS[lang] ?? { label: lang.toUpperCase(), flag: '🌐' }
                      const isActive = selectedLang === lang
                      return (
                        <button
                          key={lang}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => { onLangChange(lang); setLangOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none"
                          style={{
                            color: isActive ? 'var(--color-primary)' : 'var(--color-foreground)',
                            backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          <span aria-hidden="true">{info.flag}</span>
                          {info.label}
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
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                aria-haspopup="menu"
                aria-expanded={downloadOpen}
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Save
                <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              {downloadOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-40 rounded-xl border shadow-xl z-30 overflow-hidden py-1"
                  style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                  role="menu"
                >
                  <button
                    role="menuitem"
                    onClick={() => handleDownload('txt')}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    Save as TXT
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => handleDownload('json')}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    Save as JSON
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Info drawer */}
      <InfoDrawer
        info={manualInfo}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </>
  )
}
