'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Wrench, MoreHorizontal, Trash2 } from 'lucide-react'
import type { HubPost } from '@/lib/types'
import { MediaGrid } from './MediaGrid'
import { LikeButton, BookmarkButton, CommentTrigger, ShareButton } from './EngagementButtons'

interface PostCardProps {
  post: HubPost
  viewerId: string | undefined
  isAuthenticated: boolean
  onDelete?: (id: string) => void
  /** When true, body is not truncated and comments load inline */
  expanded?: boolean
}

export function PostCard({ post, viewerId, isAuthenticated, onDelete, expanded = false }: PostCardProps) {
  const [deleted, setDeleted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = viewerId === post.userId
  const profileHref = post.author.username
    ? `/u/${post.author.username}`
    : `/u/${post.userId}`

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    const res = await fetch(`/api/hub/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) {
      setDeleted(true)
      onDelete?.(post.id)
    }
    setDeleting(false)
    setMenuOpen(false)
  }

  if (deleted) return null

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  return (
    <article
      className="rounded-2xl border transition-colors"
      style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      aria-label={`Post by ${post.author.name}`}>

      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4">
        <Link href={profileHref} aria-label={`View ${post.author.name}'s profile`}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold select-none"
            style={{ background: 'var(--color-primary)', color: '#04140e' }}>
            {post.author.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              : (post.author.name[0] ?? 'U').toUpperCase()
            }
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <Link href={profileHref} className="text-sm font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              style={{ color: 'var(--color-foreground)' }}>
              {post.author.name}
            </Link>
            {post.author.username && (
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                @{post.author.username}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <time dateTime={post.createdAt} className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {timeAgo}
            </time>
            {(post.productName || post.productBrand) && (
              <Link href={`/community`} className="flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}>
                <Wrench className="w-3 h-3" aria-hidden />
                {post.productBrand ? `${post.productBrand}${post.productName ? ` ${post.productName}` : ''}` : post.productName}
              </Link>
            )}
          </div>
        </div>

        {isOwner && (
          <div className="relative shrink-0">
            <button type="button" onClick={() => setMenuOpen(p => !p)}
              aria-label="Post options" aria-expanded={menuOpen}
              className="p-1.5 rounded-full transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: 'var(--color-muted-foreground)' }}>
              <MoreHorizontal className="w-4 h-4" aria-hidden />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 rounded-xl border shadow-lg py-1 min-w-[140px]"
                style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
                role="menu">
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ color: 'var(--color-destructive)' }}
                  role="menuitem">
                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                  {deleting ? 'Deleting…' : 'Delete post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3">
        {post.body && (
          <p className={`text-sm leading-relaxed text-pretty whitespace-pre-wrap break-words ${!expanded && post.body.length > 400 ? 'line-clamp-6' : ''}`}
            style={{ color: 'var(--color-foreground)' }}>
            {post.body}
          </p>
        )}
        {!expanded && post.body.length > 400 && (
          <Link href={`/community/post/${post.id}`}
            className="text-xs mt-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-primary)' }}>
            Read more
          </Link>
        )}
      </div>

      {/* Media */}
      {(post.media.length > 0 || post.linkUrl) && (
        <div className="px-4 pb-3">
          <MediaGrid media={post.media} linkUrl={post.linkUrl} linkMeta={post.linkMeta} />
        </div>
      )}

      {/* Engagement bar */}
      <div className="flex items-center gap-0.5 px-3 pb-3 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <LikeButton
          targetType="post"
          targetId={post.id}
          initialCount={post.likeCount}
          initialLiked={post.isLiked ?? false}
          isAuthenticated={isAuthenticated}
        />
        <Link href={`/community/post/${post.id}#comments`}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ color: 'var(--color-muted-foreground)' }}
          aria-label={`${post.commentCount} comment${post.commentCount !== 1 ? 's' : ''}`}>
          <CommentTrigger count={post.commentCount} />
        </Link>
        <div className="flex-1" />
        <BookmarkButton postId={post.id} initialBookmarked={post.isBookmarked ?? false} isAuthenticated={isAuthenticated} />
        <ShareButton url={`/community/post/${post.id}`} />
      </div>
    </article>
  )
}
