'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

// ---------------------------------------------------------------------------
// Mobile top header logo
// ---------------------------------------------------------------------------
function MobileLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      aria-label="ClearGuide home"
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="7" rx="1" fill="white" opacity="0.9" />
          <rect x="10" y="2" width="6" height="4" rx="1" fill="white" opacity="0.7" />
          <rect x="2" y="11" width="14" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="2" y="14" width="10" height="2" rx="1" fill="white" opacity="0.6" />
        </svg>
      </div>
      <div className="leading-none">
        <span className="block text-xs font-bold" style={{ color: 'var(--color-foreground)' }}>Clear</span>
        <span className="block text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Guide</span>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface DashboardShellProps {
  children: React.ReactNode
  displayName: string
  initials: string
  onLogout: () => void
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
export function DashboardShell({ children, displayName, initials, onLogout }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--color-background-subtle)' }}
    >
      {/* Sidebar */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        displayName={displayName}
        initials={initials}
        onLogout={onLogout}
      />

      {/* Page wrapper — offset by sidebar width on desktop */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-60">

        {/* Mobile top header */}
        <header
          className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
          </button>

          <MobileLogo />

          {/* Theme toggle + user avatar */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              aria-label={`Signed in as ${displayName}`}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-[1400px] w-full mx-auto"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
