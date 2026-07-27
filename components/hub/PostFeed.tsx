'use client'

import { useState, useCallback } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import useSWRInfinite from 'swr/infinite'
import type { HubPost } from '@/lib/types'
import { PostCard } from './PostCard'
import { PostComposer } from './PostComposer'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface PostFeedProps {
  filter?: 'all' | 'following'
  manualId?: string
  currentUser: { id: string; name: string; avatarUrl: string | null } | null
  isAuthenticated: boolean
}

function getKey(pageIndex: number, previousPageData: { data: HubPost[]; nextCursor: string | null } | null) {
  if (previousPageData && !previousPageData.nextCursor) return null
  const cursor = previousPageData?.nextCursor ?? null
  return `/api/hub/posts?filter=all&limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`
}

export function PostFeed({ filter = 'all', manualId, currentUser, isAuthenticated }: PostFeedProps) {
  const [localPosts, setLocalPosts] = useState<HubPost[]>([])

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite<{ data: HubPost[]; nextCursor: string | null }>(
    (pageIndex, prev) => {
      const base = manualId ? `/api/hub/posts?manualId=${manualId}` : `/api/hub/posts?filter=${filter}`
      if (pageIndex === 0) return base + '&limit=20'
      if (!prev?.nextCursor) return null
      return `${base}&limit=20&cursor=${encodeURIComponent(prev.nextCursor)}`
    },
    fetcher,
    { revalidateOnFocus: false, revalidateFirstPage: false },
  )

  const allPosts = [
    ...localPosts,
    ...(data?.flatMap(page => page.data ?? []) ?? []).filter(p => !localPosts.find(lp => lp.id === p.id)),
  ]

  const hasMore = data ? !!data[data.length - 1]?.nextCursor : false

  const handleNewPost = useCallback((post: HubPost) => {
    setLocalPosts(prev => [post, ...prev])
  }, [])

  const handleDelete = useCallback((id: string) => {
    setLocalPosts(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <div className="space-y-3">
      <PostComposer currentUser={currentUser} onPost={handleNewPost} manualId={manualId} />

      {isLoading && (
        <div className="flex items-center justify-center py-12 gap-2" aria-live="polite" role="status">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
          <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading feed…</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-sm mb-3" style={{ color: 'var(--color-muted-foreground)' }}>Failed to load posts</p>
          <button onClick={() => setSize(1)} className="btn-outline text-xs px-4 py-2 flex items-center gap-1.5 mx-auto">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden /> Retry
          </button>
        </div>
      )}

      {!isLoading && !error && allPosts.length === 0 && (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
          <p className="text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>No posts yet</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            Be the first to share a repair tip or question.
          </p>
        </div>
      )}

      {allPosts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          viewerId={currentUser?.id}
          isAuthenticated={isAuthenticated}
          onDelete={handleDelete}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setSize(s => s + 1)}
            disabled={isValidating}
            className="btn-outline text-xs px-6 py-2.5 flex items-center gap-1.5">
            {isValidating
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />Loading…</>
              : 'Load more'
            }
          </button>
        </div>
      )}
    </div>
  )
}
