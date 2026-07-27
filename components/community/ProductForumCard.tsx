import Link from 'next/link'
import { BookOpen, MessageCircle, Globe, ChevronRight } from 'lucide-react'
import { StarRating } from '@/components/community/StarRating'
import type { PublicProduct } from '@/lib/types'

/**
 * A single public product card for the Products Forum grid.
 * Links through to the public manual viewer (guest-accessible).
 */
export function ProductForumCard({ product }: { product: PublicProduct }) {
  const hasReviews = product.reviewCount > 0
  return (
    <Link
      href={`/manual/${product.id}`}
      className="group flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Cover / thumbnail */}
      <div
        className="h-32 flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'var(--color-primary-subtle)' }}
        aria-hidden="true"
      >
        {product.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold leading-snug text-pretty"
            style={{ color: 'var(--color-foreground)' }}
          >
            {product.productName}
          </h3>
          {(product.brand || product.productModel) && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted-foreground)' }}>
              {product.brand}
              {product.brand && product.productModel ? ' · ' : ''}
              {product.productModel}
            </p>
          )}
        </div>

        {product.description && (
          <p
            className="text-xs leading-relaxed line-clamp-2 text-pretty"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {product.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap mt-1">
          {hasReviews ? (
            <span className="flex items-center gap-1.5">
              <StarRating value={Math.round(product.avgRating)} readOnly size="sm" />
              <span className="text-xs font-semibold" style={{ color: 'var(--color-foreground)' }}>
                {product.avgRating.toFixed(1)}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                ({product.reviewCount})
              </span>
            </span>
          ) : (
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              No reviews yet
            </span>
          )}
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
            {product.threadCount} discussion{product.threadCount !== 1 ? 's' : ''}
          </span>
          {product.languages?.length > 1 && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              {product.languages.length}
            </span>
          )}
        </div>

        {/* Footer CTA */}
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold mt-1 transition-colors"
          style={{ color: 'var(--color-primary)' }}
        >
          View guide
          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
