'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Search, Loader2, Wrench, AlertTriangle } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function HowToFixSearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Simple debounce for search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500)
    return () => clearTimeout(timer)
  }, [query])

  const { data, error, isLoading } = useSWR(
    debouncedQuery ? `/api/ifixit/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher
  )

  const results = data?.results || []

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-900/10 z-0 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl mb-6 ring-1 ring-slate-200/50">
            <Wrench className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            How to Fix <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Anything</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
            Search thousands of step-by-step repair guides powered by the iFixit open database. Find your device, gather your tools, and fix it yourself.
          </p>

          {/* Glassmorphism Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-white/80 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-2xl flex items-center p-2 shadow-sm transition-shadow hover:shadow-md">
              <div className="pl-4 pr-2">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a device or repair (e.g., 'iPhone battery')"
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 py-3 text-lg outline-none"
              />
              {isLoading && (
                <div className="pr-4">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 mb-8 max-w-2xl mx-auto">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">Failed to search. Please try again later.</p>
          </div>
        )}

        {!debouncedQuery && !isLoading && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">Type a device name above to start finding repair guides.</p>
          </div>
        )}

        {debouncedQuery && !isLoading && results.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">No repair guides found for "{debouncedQuery}".</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((guide: any) => (
              <Link
                href={`/tools/how-to-fix/${guide.guideid}`}
                key={guide.guideid}
                className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-slate-200/50 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  {guide.image?.standard ? (
                    <img
                      src={guide.image.standard}
                      alt={guide.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <Wrench className="w-10 h-10 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                    {guide.difficulty || 'Unknown Difficulty'}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                    {guide.type || 'Repair Guide'}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                    {guide.summary}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      {guide.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      View Guide &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Attribution Footer */}
      <footer className="border-t bg-white border-slate-100 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>Open community tool for educational access.</p>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Powered by</span>
            <a href="https://www.ifixit.com" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 hover:underline">
              iFixit
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
