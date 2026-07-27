'use client'

import { useState, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { Loader2, AlertCircle, PenLine } from 'lucide-react'
import { StarRating } from './StarRating'
import { ReviewCard } from './ReviewCard'
import { GuestBanner } from './GuestBanner'
import type { ProductReview } from '@/lib/types'
import type { User } from 'firebase/auth'

// ---------------------------------------------------------------------------
// Mock data — mirrors a real DB payload for loading state
// ---------------------------------------------------------------------------
const MOCK_REVIEWS: ProductReview[] = [
  {
    id: 'mock-1',
    manualId: '',
    userId: 'u1',
    rating: 5,
    title: 'Crystal-clear instructions',
    body: 'Everything was laid out perfectly. Set up took about 10 minutes following this guide step by step.',
    helpfulCount: 14,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    author: { name: 'Sarah M.', image: null },
  },
  {
    id: 'mock-2',
    manualId: '',
    userId: 'u2',
    rating: 4,
    title: 'Good overall, minor gaps',
    body: 'Most sections are thorough. A few steps around initial calibration could be more detailed, but nothing that stopped me from completing setup.',
    helpfulCount: 7,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    author: { name: 'James T.', image: null },
  },
  {
    id: 'mock-3',
    manualId: '',
    userId: 'u3',
    rating: 3,
    title: 'Decent but could be clearer',
    body: 'The AR mode was a game-changer for assembly. Text instructions are a bit dense in sections 3 and 4.',
    helpfulCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    author: { name: 'Priya K.', image: null },
  },
]

// ---------------------------------------------------------------------------
// Rating distribution bar
// ---------------------------------------------------------------------------
function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)
  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
      <span className="w-4 text-right shrink-0">{star}</span>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-border)' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${count} ${star}-star review${count !== 1 ? 's' : ''}`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: '#f59e0b' }}
        />
      </div>
      <span className="w-6 shrink-0">{count}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Write Review Form
// ---------------------------------------------------------------------------
function WriteReviewForm({ manualId, userId, onSubmitted }: { manualId: string; userId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [open, setOpen]     = useState(false)

  const BODY_LIMIT = 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating.'); return }
    if (!body.trim()) { setError('Review body cannot be empty.'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualId, rating, title: title.trim() || null, body: body.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to submit review')
      onSubmitted()
      setOpen(false)
      setRating(0); setTitle(''); setBody('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
      >
        <PenLine className="w-4 h-4" aria-hidden="true" />
        Write a review
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      aria-label="Write a review form"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Write a review</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          style={{ color: 'var(--color-muted-foreground)' }}
          aria-label="Cancel review"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
          Your rating <span aria-hidden="true">*</span>
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="review-title" className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
          Title (optional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Summarise your experience"
          className="auth-input text-sm"
          style={{ height: '36px' }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="review-body" className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
            Review <span aria-hidden="true">*</span>
          </label>
          <span
            aria-live="polite"
            className="text-xs tabular-nums"
            style={{ color: body.length > BODY_LIMIT * 0.9 ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}
          >
            {body.length}/{BODY_LIMIT}
          </span>
        </div>
        <textarea
          id="review-body"
          value={body}
          onChange={e => setBody(e.target.value.slice(0, BODY_LIMIT))}
          rows={4}
          placeholder="Share your experience with this manual…"
          className="auth-input text-sm resize-none leading-relaxed"
          style={{ borderColor: body.length >= BODY_LIMIT ? 'var(--color-destructive)' : undefined }}
        />
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0 || !body.trim()}
        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        Submit review
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// ReviewsSection (main export)
// ---------------------------------------------------------------------------
interface ReviewsSectionProps {
  manualId: string
  user: User | null
  currentPath: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function ReviewsSection({ manualId, user, currentPath }: ReviewsSectionProps) {
  const swrKey = `/api/community/reviews?manualId=${manualId}`
  const { data, error, isLoading } = useSWR<{ data: ProductReview[] }>(swrKey, fetcher, {
    fallbackData: { data: MOCK_REVIEWS.map(r => ({ ...r, manualId })) },
    revalidateOnFocus: false,
  })

  const reviews = data?.data ?? []
  const avg     = reviews.length === 0 ? 0 : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const dist    = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }))

  const handleHelpful = useCallback(async (reviewId: string) => {
    await fetch(`/api/community/reviews/${reviewId}/helpful`, { method: 'POST' })
    mutate(swrKey)
  }, [swrKey])

  return (
    <div className="flex flex-col gap-5" aria-label="Product reviews">
      {/* Summary */}
      <div
        className="rounded-2xl border p-5 flex flex-col sm:flex-row gap-6"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col items-center justify-center gap-1 shrink-0">
          <span className="text-4xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            {avg > 0 ? avg.toFixed(1) : '—'}
          </span>
          <StarRating value={Math.round(avg)} readOnly size="sm" />
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 justify-center">
          {dist.map(d => (
            <RatingBar key={d.star} star={d.star} count={d.count} total={reviews.length} />
          ))}
        </div>
      </div>

      {/* Guest CTA or write form */}
      {!user ? (
        <GuestBanner
          message="Sign in to write a review and help other users."
          returnTo={currentPath}
        />
      ) : (
        <WriteReviewForm
          manualId={manualId}
          userId={user.uid}
          onSubmitted={() => mutate(swrKey)}
        />
      )}

      {/* Review list */}
      {isLoading && (
        <div className="flex justify-center py-6" role="status" aria-label="Loading reviews">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm p-3 rounded-xl border"
          style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          Failed to load reviews.
        </div>
      )}
      {!isLoading && reviews.length === 0 && (
        <p className="text-sm text-center py-6" style={{ color: 'var(--color-muted-foreground)' }}>
          No reviews yet. Be the first to share your experience.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map(r => (
          <ReviewCard
            key={r.id}
            review={r}
            onHelpful={handleHelpful}
            isAuthenticated={!!user}
          />
        ))}
      </div>
    </div>
  )
}
