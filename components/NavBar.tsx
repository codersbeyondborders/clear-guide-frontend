'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { BookOpen, Menu, X, UserRound, Building2, ChevronDown } from 'lucide-react'

const MAIN_NAV_LINKS = [
  { label: 'About',        href: '#about'             },
  { label: 'Find Product', href: '#find-your-product' },
  { label: 'Features',     href: '#features'          },
  { label: 'Pricing',      href: '#pricing'           },
  { label: 'Repair Hub',   href: '/community'         },
  { label: 'How to Fix',   href: '/tools/how-to-fix'  },
  { label: 'FAQ',          href: '#faq'               },
  { label: 'Contact',      href: '#contact'           },
]

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mfgMenuOpen, setMfgMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mfgMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close manufacturer dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (mfgMenuRef.current && !mfgMenuRef.current.contains(e.target as Node)) {
        setMfgMenuOpen(false)
      }
    }
    if (mfgMenuOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [mfgMenuOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <nav
        className="container flex h-16 items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded shrink-0"
          aria-label="ClearGuide home"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Clear<span style={{ color: 'var(--color-primary)' }}>Guide</span>
          </span>
        </Link>

        {/* Desktop main links */}
        <div className="hidden lg:flex items-center gap-0.5" role="list">
          {MAIN_NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              role="listitem"
              className="px-2.5 py-1.5 rounded-lg text-[0.8125rem] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop right actions: User, Manufacturer, Get Started */}
        <div className="hidden lg:flex items-center gap-1.5">
          {/* User */}
          <Link
            href="/user/sign-in"
            className="btn-ghost text-sm text-slate-600 inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <UserRound className="w-4 h-4" aria-hidden="true" />
            User
          </Link>

          <span className="w-px h-5 bg-slate-200 mx-0.5" aria-hidden="true" />

          {/* Manufacturer dropdown */}
          <div className="relative" ref={mfgMenuRef}>
            <button
              type="button"
              onClick={() => setMfgMenuOpen((v) => !v)}
              aria-expanded={mfgMenuOpen}
              aria-haspopup="menu"
              aria-label="Manufacturer portal"
              className="btn-ghost text-sm text-slate-500 inline-flex items-center gap-1 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
            >
              <Building2 className="w-4 h-4" aria-hidden="true" />
              Manufacturer
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${mfgMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown */}
            {mfgMenuOpen && (
              <div
                role="menu"
                aria-label="Manufacturer portal menu"
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border bg-white shadow-lg py-1 z-50"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Link
                  href="/manufacturer/sign-in"
                  role="menuitem"
                  onClick={() => setMfgMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Sign in to portal
                </Link>
                <Link
                  href="/manufacturer/sign-up"
                  role="menuitem"
                  onClick={() => setMfgMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Register your company
                </Link>
              </div>
            )}
          </div>

          {/* Get Started button */}
          <a href="#get-started" className="btn-primary text-sm whitespace-nowrap">
            Get Started
          </a>
        </div>

        {/* Mobile/tablet hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile/tablet drawer */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-slate-100 bg-white px-4 pb-6 pt-4 flex flex-col gap-1"
          role="menu"
          aria-label="Mobile navigation"
        >
          {MAIN_NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={closeMobile}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {label}
            </Link>
          ))}

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
            {/* User */}
            <Link
              href="/user/sign-in"
              onClick={closeMobile}
              className="btn-ghost text-sm text-center inline-flex items-center justify-center gap-1.5"
            >
              <UserRound className="w-4 h-4" aria-hidden="true" />
              User
            </Link>

            <div className="flex flex-col gap-1 rounded-xl border px-3 py-2" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-semibold text-slate-400 mb-1">Manufacturer Portal</p>
              <Link
                href="/manufacturer/sign-in"
                onClick={closeMobile}
                className="flex items-center gap-1.5 text-sm text-slate-700 py-1 hover:text-slate-900 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                Sign in to portal
              </Link>
              <Link
                href="/manufacturer/sign-up"
                onClick={closeMobile}
                className="flex items-center gap-1.5 text-sm text-slate-700 py-1 hover:text-slate-900 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
                Register your company
              </Link>
            </div>

            <a
              href="#get-started"
              onClick={closeMobile}
              className="btn-primary text-sm text-center"
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
