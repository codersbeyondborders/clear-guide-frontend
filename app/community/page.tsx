'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Search, Package, Loader2, AlertCircle, SlidersHorizontal, X,
  Wrench, Users, Rss,
} from 'lucide-react'
import { ProductForumCard } from '@/components/community/ProductForumCard'
import { GuestBanner } from '@/components/community/GuestBanner'
import { PostFeed } from '@/components/hub/PostFeed'
import { useEndUser } from '@/hooks/useEndUser'
import type { PublicProduct } from '@/lib/types'

type Tab = 'feed' | 'products'
type SortKey = 'recent' | 'top-rated' | 'discussed' | 'name'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent',    label: 'Recently updated' },
  { value: 'top-rated', label: 'Top rated' },
  { value: 'discussed', label: 'Most discussed' },
  { value: 'name',      label: 'Name (A–Z)' },
]

interface ForumResponse { data: PublicProduct[]; brands: string[] }
const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CommunityPage() {
  const { user, isLoading: authLoading } = useEndUser()
  const [tab, setTab]         = useState<Tab>('feed')
  const [feedFilter, setFeedFilter] = useState<'all' | 'following'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [search, setSearch]   = useState('')
  const [brand, setBrand]     = useState('')
  const [sort, setSort]       = useState<SortKey>('recent')

  const CATEGORIES = ['All', 'Electronics', 'Appliances', 'Smartphones', 'Laptops', 'HVAC', 'Vehicles', 'Power tools']

  const { data, error, isLoading } = useSWR<ForumResponse>(
    '/api/hub/public/manuals',
    fetcher,
    { revalidateOnFocus: false },
  )

  const allProducts = data?.data ?? []
  const brands = data?.brands ?? []

  const products = useMemo(() => {
    let list = [...allProducts]
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.productModel?.toLowerCase().includes(q)
    )
    if (brand) list = list.filter(p => p.brand === brand)
    switch (sort) {
      case 'top-rated': list.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount); break
      case 'discussed': list.sort((a, b) => b.threadCount - a.threadCount); break
      case 'name':      list.sort((a, b) => a.productName.localeCompare(b.productName)); break
      default:          list.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    }
    return list
  }, [allProducts, search, brand, sort])

  const hasFilters = Boolean(search.trim() || brand)

  const currentUser = user
    ? {
        id: user.uid,
        name: user.displayName ?? user.email ?? 'You',
        avatarUrl: user.photoURL ?? null,
      }
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>

      {/* Header */}
      <header className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
            <Link href="/community"
              className="text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              style={{ color: 'var(--color-foreground)' }}>
              Repair Hub
            </Link>
          </div>
          <nav className="flex items-center gap-1" aria-label="Community navigation">
            <Link href="/find"
              className="text-xs px-3 py-1.5 rounded-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors hover:bg-background-subtle"
              style={{ color: 'var(--color-muted-foreground)' }}>
              Find a manual
            </Link>
            {!authLoading && (
              !user ? (
                <Link href="/user/sign-in"
                  className="inline-flex items-center h-8 px-3 rounded-xl border text-xs font-semibold"
                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}>
                  Sign in
                </Link>
              ) : (
                <Link href={`/u/${user.uid}`}
                  className="flex items-center gap-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full px-2 py-1 transition-colors hover:bg-card"
                  style={{ color: 'var(--color-foreground)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'var(--color-primary)', color: '#04140e' }}>
                    {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px] hidden sm:block">
                    {user.displayName ?? user.email}
                  </span>
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-0 border-b" style={{ borderColor: 'var(--color-border)' }}
            role="tablist" aria-label="Community tabs">
            {([
              { value: 'feed',     label: 'Feed',     icon: Rss },
              { value: 'products', label: 'Products', icon: Package },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" role="tab"
                id={`tab-${value}`}
                aria-selected={tab === value}
                aria-controls={`tabpanel-${value}`}
                onClick={() => setTab(value)}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  borderColor: tab === value ? 'var(--color-primary)' : 'transparent',
                  color: tab === value ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                }}>
                <Icon className="w-3.5 h-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">

        {/* ----- Feed tab ----- */}
        <div id="tabpanel-feed" role="tabpanel" aria-labelledby="tab-feed"
          className={tab === 'feed' ? 'block' : 'hidden'}>

          {/* Feed Header Controls */}
          <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                <h1 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>Community Feed</h1>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                Share repair tips, ask questions, and help others fix their devices.
              </p>
            </div>

            {/* All vs Following Sub-Filter */}
            {user && (
              <div className="flex items-center p-0.5 rounded-xl border shrink-0"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setFeedFilter('all')}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${feedFilter === 'all' ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: feedFilter === 'all' ? 'var(--color-primary-subtle)' : 'transparent',
                    color: feedFilter === 'all' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  }}>
                  All Posts
                </button>
                <button
                  type="button"
                  onClick={() => setFeedFilter('following')}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${feedFilter === 'following' ? 'shadow-sm' : ''}`}
                  style={{
                    backgroundColor: feedFilter === 'following' ? 'var(--color-primary-subtle)' : 'transparent',
                    color: feedFilter === 'following' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  }}>
                  Following
                </button>
              </div>
            )}
          </section>

          {/* Category Chips Scrollbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none" aria-label="Filter by category">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="text-xs px-3 py-1 rounded-full border whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-card)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  }}>
                  {cat}
                </button>
              )
            })}
          </div>

          {!authLoading && !user && (
            <div className="mb-4">
              <GuestBanner returnTo="/community"
                message="Sign in to post repair tips, ask questions, and engage with the community." />
            </div>
          )}

          <PostFeed
            filter={feedFilter}
            currentUser={currentUser}
            isAuthenticated={!!user}
          />
        </div>

        {/* ----- Products tab ----- */}
        <div id="tabpanel-products" role="tabpanel" aria-labelledby="tab-products"
          className={tab === 'products' ? 'block' : 'hidden'}>

          {/* Hero */}
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-foreground)' }}>Products Forum</h1>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Browse every publicly listed product — read reviews and discussions, or sign in to contribute.
            </p>
          </section>

          {/* Search + filter */}
          <section aria-label="Search and filter products" className="flex flex-col gap-3 mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--color-muted-foreground)' }} aria-hidden />
              <label htmlFor="product-search" className="sr-only">Search products</label>
              <input id="product-search" type="search" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by product, brand, or model…"
                className="w-full h-10 pl-9 pr-4 rounded-xl border text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden />
              <label htmlFor="brand-filter" className="sr-only">Filter by brand</label>
              <select id="brand-filter" value={brand} onChange={e => setBrand(e.target.value)}
                className="h-9 px-3 rounded-lg border text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
                <option value="">All brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <label htmlFor="sort-select" className="sr-only">Sort products</label>
              <select id="sort-select" value={sort} onChange={e => setSort(e.target.value as SortKey)}
                className="h-9 px-3 rounded-lg border text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {hasFilters && (
                <button type="button" onClick={() => { setSearch(''); setBrand('') }}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-card)' }}>
                  <X className="w-3.5 h-3.5" aria-hidden />Clear
                </button>
              )}
              <p className="text-xs ml-auto" aria-live="polite" style={{ color: 'var(--color-muted-foreground)' }}>
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </section>

          {/* Results */}
          <section aria-label="Products" aria-busy={isLoading}>
            {isLoading && (
              <div className="flex justify-center py-16" role="status" aria-label="Loading products">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
              </div>
            )}
            {error && !isLoading && (
              <div className="flex items-center gap-2 text-sm p-4 rounded-xl border" role="alert"
                style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)' }}>
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
                Failed to load products. Please try again.
              </div>
            )}
            {!isLoading && !error && products.length === 0 && (
              <div className="text-center py-16 px-4 rounded-2xl border"
                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                <Package className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden />
                <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                  {hasFilters ? 'No products match your filters.' : 'No public products yet.'}
                </p>
                {hasFilters && (
                  <button type="button" onClick={() => { setSearch(''); setBrand('') }}
                    className="mt-3 text-sm font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    style={{ color: 'var(--color-primary)' }}>
                    Clear filters
                  </button>
                )}
              </div>
            )}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map(p => <ProductForumCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t py-5 mt-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Powered by <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>ClearGuide</span>
          </p>
          <Link href="/find" className="text-xs font-medium hover:underline underline-offset-2"
            style={{ color: 'var(--color-muted-foreground)' }}>
            Find a manual
          </Link>
        </div>
      </footer>
    </div>
  )
}
