import Link from 'next/link'
import { MessageCircle, CheckCircle2, Pin } from 'lucide-react'
import type { ForumThread } from '@/lib/types'

interface ThreadCardProps {
  thread: ForumThread
  manualId?: string
  showManualTag?: boolean
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

export function ThreadCard({ thread, manualId, showManualTag = false }: ThreadCardProps) {
  const href = `/manual/${thread.manualId}/forum/${thread.id}`
  const initials = thread.author?.name
    ? thread.author.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <article
      className="rounded-xl border transition-all hover:shadow-sm"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <Link
        href={href}
        className="flex items-start gap-4 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
        aria-label={`Thread: ${thread.title}`}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-hidden="true"
        >
          {thread.author?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thread.author.image} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {thread.isPinned && (
                <Pin className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-primary)' }} aria-label="Pinned" />
              )}
              <h3
                className="text-sm font-semibold leading-snug text-pretty min-w-0"
                style={{ color: 'var(--color-foreground)' }}
              >
                {thread.title}
              </h3>
            </div>
            {thread.isSolved && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                  color: 'var(--color-primary)',
                }}
              >
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                Solved
              </span>
            )}
          </div>

          <p
            className="text-xs mt-1 leading-relaxed line-clamp-2 text-pretty"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {thread.body}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {thread.author?.name ?? 'Anonymous'}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              &middot;
            </span>
            <time dateTime={thread.createdAt} className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {relativeTime(thread.createdAt)}
            </time>
            <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: 'var(--color-muted-foreground)' }}>
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              {thread.replyCount}
            </span>
            {showManualTag && thread.manualName && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-background-subtle)' }}
              >
                {thread.manualName}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
