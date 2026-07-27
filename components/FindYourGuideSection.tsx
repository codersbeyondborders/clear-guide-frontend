'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QrCode, SlidersHorizontal, LogIn, UserPlus, Camera, Users } from 'lucide-react'
import { QRCodeDisplay } from '@/components/QRCodeDisplay'
import { ManualSearchForm } from '@/components/ManualSearchForm'

type Tab = 'qr' | 'manual'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'qr',     label: 'Scan QR Code', icon: QrCode            },
  { key: 'manual', label: 'Enter Details', icon: SlidersHorizontal },
]

export function FindYourGuideSection() {
  const [activeTab, setActiveTab] = useState<Tab>('qr')

  return (
    <section
      id="find-guide"
      aria-labelledby="find-guide-heading"
      className="py-16 md:py-24"
      style={{ backgroundColor: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="container">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5 border"
            style={{ backgroundColor: 'rgba(9,188,124,0.12)', borderColor: 'rgba(9,188,124,0.3)', color: '#09bc7c' }}
          >
            <QrCode className="w-3 h-3" aria-hidden="true" />
            For End Users
          </div>
          <h2
            id="find-guide-heading"
            className="text-3xl md:text-4xl font-bold leading-tight text-balance mb-3"
            style={{ color: '#f1f5f9' }}
          >
            Find Your Product Guide
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(241,245,249,0.55)' }}>
            Scan the QR code on your product or enter its details manually — your accessible guide
            opens instantly, no app required.
          </p>

          {/* End-user account options */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <Link
              href="/user/sign-in"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ backgroundColor: '#09bc7c', color: '#04140e', boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset' }}
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              Sign in
            </Link>
            <Link
              href="/user/sign-up"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold border transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#f1f5f9' }}
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              Create free account
            </Link>
          </div>
          <p className="text-xs mt-3" style={{ color: 'rgba(241,245,249,0.4)' }}>
            An account unlocks AI chat, community forums &amp; saved guides — or continue as a guest below.
          </p>
        </div>

        {/* ── Card ────────────────────────────────────────────────────── */}
        <div
          className="w-full rounded-3xl overflow-hidden border"
          style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#1e293b' }}
        >
          {/* Mobile-only tab bar (hidden on md+) */}
          <div
            className="flex md:hidden border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            role="tablist"
            aria-label="How to find your guide"
          >
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  role="tab"
                  id={`tab-mobile-${key}`}
                  aria-selected={isActive}
                  aria-controls={`panel-mobile-${key}`}
                  onClick={() => setActiveTab(key)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  style={{ color: isActive ? '#09bc7c' : 'rgba(241,245,249,0.45)' }}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {label}
                  {isActive && (
                    <span
                      className="absolute inset-x-0 bottom-0 h-0.5"
                      style={{ backgroundColor: '#09bc7c' }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Panel body */}
          {/* Mobile: show one panel at a time via display none */}
          {/* Desktop (md+): always show both panels side-by-side via grid */}
          <div className="md:grid md:grid-cols-[1fr_1px_1fr] md:divide-y-0">

            {/* ── QR panel ──────────────────────────────────────────── */}
            <div
              id="panel-mobile-qr"
              role="tabpanel"
              aria-labelledby="tab-mobile-qr"
              className={`p-8 md:p-10 flex flex-col items-center gap-6 text-center md:flex ${activeTab === 'qr' ? 'flex' : 'hidden'}`}
            >
              <QRCodeDisplay targetId="demo-qr-123" />

              <div className="w-full max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(241,245,249,0.35)' }}>
                  How it works
                </p>
                <ol className="space-y-2.5 text-left" aria-label="QR scan steps">
                  {[
                    'Open your phone camera or QR app',
                    'Point it at the QR code on your product',
                    'Tap the notification — your guide opens',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                        style={{ backgroundColor: 'rgba(9,188,124,0.15)', color: '#09bc7c' }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: 'rgba(241,245,249,0.6)' }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Vertical divider — desktop only */}
            <div
              className="hidden md:block self-stretch"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', width: '1px' }}
              aria-hidden="true"
            />

            {/* ── Manual search panel ───────────────────────────────── */}
            <div
              id="panel-mobile-manual"
              role="tabpanel"
              aria-labelledby="tab-mobile-manual"
              className={`p-8 md:p-10 md:flex md:flex-col md:justify-center ${activeTab === 'manual' ? 'flex flex-col' : 'hidden md:flex'}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: 'rgba(241,245,249,0.35)' }}>
                Search by product details
              </p>
              <div className="find-guide-form-surface">
                <ManualSearchForm />
              </div>
            </div>
          </div>

          {/* ── Bottom strip ────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-center justify-between gap-3 px-8 py-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/find"
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                style={{ color: '#09bc7c' }}
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                Search by photo
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                style={{ color: 'rgba(241,245,249,0.55)' }}
              >
                <Users className="w-3.5 h-3.5" aria-hidden="true" />
                Products Forum
              </Link>
            </div>
            <Link
              href="/find"
              className="text-xs font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              style={{ color: 'rgba(241,245,249,0.45)' }}
            >
              Open full product finder &rarr;
            </Link>
          </div>
        </div>

        {/* ── Device pills ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {['No app required', 'Works on iOS & Android', 'Accessible & screen-reader friendly'].map((label) => (
            <span
              key={label}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(241,245,249,0.45)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#09bc7c' }} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>

      </div>
    </section>
  )
}
