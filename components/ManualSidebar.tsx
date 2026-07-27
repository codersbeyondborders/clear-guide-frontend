'use client'

import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'

interface Section {
  id: string
  sectionNumber: number
  title: string
}

interface ManualSidebarProps {
  sections: Section[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function ManualSidebar({ sections, activeIndex, onSelect }: ManualSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { highContrast } = useAccessibility()
  const hc = highContrast

  const navContent = (
    <nav aria-label="Manual sections">
      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
        Contents
      </p>
      <ul className="space-y-0.5">
        {sections.map((section, idx) => (
          <li key={section.id}>
            <button
              onClick={() => { onSelect(idx); setMobileOpen(false) }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 ${
                idx === activeIndex
                  ? hc ? 'bg-yellow-400 text-black font-semibold focus-visible:outline-yellow-400' : 'bg-primary-subtle text-primary font-semibold focus-visible:outline-primary'
                  : hc ? 'text-yellow-300 hover:bg-gray-800 focus-visible:outline-yellow-400' : 'text-foreground hover:bg-background-subtle focus-visible:outline-primary'
              }`}
              aria-current={idx === activeIndex ? 'true' : undefined}
            >
              <span className={`text-xs mr-2 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`} aria-hidden="true">
                {String(section.sectionNumber).padStart(2, '0')}
              </span>
              <span className="break-words leading-snug">{section.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden flex items-center">
        <button
          onClick={() => setMobileOpen(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border-border text-foreground hover:bg-background-subtle focus-visible:outline-primary'}`}
          aria-label="Open table of contents"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          <Menu className="w-4 h-4" aria-hidden="true" />
          Contents
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Table of contents">
          {/* Backdrop */}
          <button className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Close sidebar" />
          {/* Panel */}
          <div id="mobile-sidebar" className={`relative w-72 max-w-[80vw] h-full overflow-y-auto p-6 shadow-xl ${hc ? 'bg-gray-900' : 'bg-card'}`}>
            <button
              onClick={() => setMobileOpen(false)}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'text-yellow-400 hover:bg-gray-800 focus-visible:outline-yellow-400' : 'text-muted-foreground hover:bg-background-subtle focus-visible:outline-primary'}`}
              aria-label="Close table of contents"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-8">{navContent}</div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block w-60 flex-shrink-0 rounded-xl border p-4 self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto ${hc ? 'bg-gray-900 border-yellow-400/40' : 'bg-card border-border'}`}>
        {navContent}
      </aside>
    </>
  )
}
