'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Bookmark, Share2, UserPlus, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

// ---------- LikeButton ----------
interface LikeButtonProps {
  targetType: 'post' | 'comment' | 'thread_reply'
  targetId: string
  initialCount: number
  initialLiked: boolean
  isAuthenticated: boolean
  size?: 'sm' | 'md'
}

export function LikeButton({ targetType, targetId, initialCount, initialLiked, isAuthenticated, size = 'sm' }: LikeButtonProps) {
  const [liked, setLiked]   = useState(initialLiked)
  const [count, setCount]   = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    if (!isAuthenticated) { router.push('/user/sign-in'); return }
    if (loading) return
    // Optimistic
    setLiked(p => !p)
    setCount(p => liked ? Math.max(0, p - 1) : p + 1)
    setLoading(true)
    const res = await fetch('/api/hub/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId }),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.data) {
      setLiked(json.data.liked)
      setCount(json.data.count)
    } else {
      // Revert
      setLiked(p => !p)
      setCount(p => liked ? p + 1 : Math.max(0, p - 1))
    }
    setLoading(false)
  }

  const iconClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={liked ? `Unlike (${count})` : `Like (${count})`}
      aria-pressed={liked}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        color: liked ? '#e11d48' : 'var(--color-muted-foreground)',
        background: liked ? 'rgba(225,29,72,0.08)' : 'transparent',
      }}>
      <Heart className={`${iconClass} transition-all ${liked ? 'fill-current' : ''}`} aria-hidden />
      <span aria-live="polite">{count > 0 ? count : ''}</span>
    </button>
  )
}

// ---------- BookmarkButton ----------
interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
  isAuthenticated: boolean
}

export function BookmarkButton({ postId, initialBookmarked, isAuthenticated }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    if (!isAuthenticated) { router.push('/user/sign-in'); return }
    if (loading) return
    setBookmarked(p => !p)
    setLoading(true)
    const res = await fetch('/api/hub/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.data) {
      setBookmarked(json.data.bookmarked)
    } else {
      setBookmarked(p => !p)
    }
    setLoading(false)
  }

  return (
    <button type="button" onClick={toggle}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      aria-pressed={bookmarked}
      className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        color: bookmarked ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
        background: bookmarked ? 'var(--color-primary-subtle)' : 'transparent',
      }}>
      <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} aria-hidden />
    </button>
  )
}

// ---------- CommentTrigger ----------
export function CommentTrigger({ count, onClick }: { count: number; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      aria-label={`${count} comment${count !== 1 ? 's' : ''}`}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ color: 'var(--color-muted-foreground)' }}>
      <MessageCircle className="w-4 h-4" aria-hidden />
      <span>{count > 0 ? count : ''}</span>
    </button>
  )
}

// ---------- ShareButton ----------
export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
    if (navigator.share) {
      await navigator.share({ url: fullUrl }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button type="button" onClick={share}
      aria-label={copied ? 'Link copied' : 'Share'}
      className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ color: copied ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
      <Share2 className="w-4 h-4" aria-hidden />
      {copied && <span aria-live="polite">Copied</span>}
    </button>
  )
}

// ---------- FollowButton ----------
interface FollowButtonProps {
  userId: string
  initialFollowing: boolean
  initialCount: number
  isAuthenticated: boolean
  viewerId: string | undefined
}

export function FollowButton({ userId, initialFollowing, initialCount, isAuthenticated, viewerId }: FollowButtonProps) {
  const [following, setFollowing]   = useState(initialFollowing)
  const [count, setCount]           = useState(initialCount)
  const [loading, setLoading]       = useState(false)
  const router = useRouter()

  if (viewerId === userId) return null

  async function toggle() {
    if (!isAuthenticated) { router.push('/user/sign-in'); return }
    if (loading) return
    setFollowing(p => !p)
    setCount(p => following ? Math.max(0, p - 1) : p + 1)
    setLoading(true)
    const res = await fetch('/api/hub/follows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followingId: userId }),
    })
    const json = await res.json().catch(() => null)
    if (res.ok && json?.data) {
      setFollowing(json.data.following)
      setCount(json.data.followerCount)
    } else {
      setFollowing(p => !p)
      setCount(p => following ? p + 1 : Math.max(0, p - 1))
    }
    setLoading(false)
  }

  return (
    <button type="button" onClick={toggle}
      aria-label={following ? 'Unfollow' : 'Follow'}
      aria-pressed={following}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        borderColor: following ? 'var(--color-border)' : 'var(--color-primary)',
        color: following ? 'var(--color-muted-foreground)' : 'var(--color-primary)',
        background: following ? 'transparent' : 'var(--color-primary-subtle)',
      }}>
      {following
        ? <><UserCheck className="w-3.5 h-3.5" aria-hidden /> Following</>
        : <><UserPlus className="w-3.5 h-3.5" aria-hidden /> Follow</>
      }
    </button>
  )
}
