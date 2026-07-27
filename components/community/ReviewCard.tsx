import { ThumbsUp } from 'lucide-react'
import { StarRating } from './StarRating'
import type { ProductReview } from '@/lib/types'

interface ReviewCardProps {
  review: ProductReview
  onHelpful?: (id: string) => void
  isAuthenticated?: boolean
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins < 2)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ReviewCard({ review, onHelpful, isAuthenticated }: ReviewCardProps) {
  const initials = review.author?.name
    ? review.author.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <article
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Header: avatar + name + rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
            aria-hidden="true"
          >
            {review.author?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.author.image}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
              {review.author?.name ?? 'Anonymous'}
            </p>
            <time
              dateTime={review.createdAt}
              className="text-xs"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {relativeTime(review.createdAt)}
            </time>
          </div>
        </div>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      {/* Title + body */}
      {review.title && (
        <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {review.title}
        </p>
      )}
      <p className="text-sm leading-relaxed text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>
        {review.body}
      </p>

      {/* Helpful button */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => isAuthenticated && onHelpful?.(review.id)}
          disabled={!isAuthenticated}
          aria-label={`Mark as helpful (${review.helpfulCount})`}
          className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-background-subtle)' }}
        >
          <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
          Helpful ({review.helpfulCount})
        </button>
      </div>
    </article>
  )
}
