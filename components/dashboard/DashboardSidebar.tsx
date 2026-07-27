'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, BarChart2, Settings, LogOut, X, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------
function ClearGuideLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
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
      <div className="leading-none">
        <span className="block text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-sm font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { label: 'Dashboard',  href: '/manufacturer/dashboard',  icon: LayoutDashboard },
  { label: 'Analytics',  href: '/manufacturer/analytics',  icon: BarChart2       },
  { label: 'Team',       href: '/manufacturer/settings?tab=team', icon: Users    },
  { label: 'Settings',   href: '/manufacturer/settings',   icon: Settings        },
] as const

interface SidebarProps {
  /** Whether the mobile drawer is open */
  isOpen: boolean
  onClose: () => void
  displayName: string
  initials: string
  onLogout: () => void
}

// ---------------------------------------------------------------------------
// Sidebar content (shared between desktop + mobile drawer)
// ---------------------------------------------------------------------------
function SidebarContent({
  displayName,
  initials,
  onLogout,
  onClose,
  isMobile = false,
}: {
  displayName: string
  initials: string
  onLogout: () => void
  onClose?: () => void
  isMobile?: boolean
}) {
  const pathname = usePathname()

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--color-card)', borderRight: '1px solid var(--color-border)' }}
    >
      {/* Logo row */}
      <div
        className="flex items-center justify-between px-5 h-16 shrink-0 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <ClearGuideLogo />
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-muted-foreground)' }}
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        <p
          className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Menu
        </p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          // Exact match for dashboard; prefix match for analytics / settings
          const isActive = href === '/manufacturer/dashboard'
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={label}
              href={href}
              onClick={isMobile ? onClose : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                aria-hidden="true"
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Theme + User profile + logout */}
      <div className="px-3 py-4 space-y-1">
        {/* Theme toggle row */}
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
            Theme
          </span>
          <ThemeToggle />
        </div>
        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ color: 'var(--color-muted-foreground)' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-destructive) 8%, transparent)'
            e.currentTarget.style.color = 'var(--color-destructive)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--color-muted-foreground)'
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>

        {/* User info */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ backgroundColor: 'var(--color-background-subtle)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
              {displayName}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>Manufacturer</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------
export function DashboardSidebar({ isOpen, onClose, displayName, initials, onLogout }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar (always visible on lg+) ─────────────────────── */}
      <aside
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:z-30"
        aria-label="Sidebar navigation"
      >
        <SidebarContent displayName={displayName} initials={initials} onLogout={onLogout} />
      </aside>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar navigation"
        aria-hidden={!isOpen}
      >
        <SidebarContent
          displayName={displayName}
          initials={initials}
          onLogout={onLogout}
          onClose={onClose}
          isMobile
        />
      </aside>
    </>
  )
}
