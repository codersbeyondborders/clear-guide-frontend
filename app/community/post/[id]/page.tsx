'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Wrench } from 'lucide-react'
import { PostCard } from '@/components/hub/PostCard'
import { CommentThread } from '@/components/hub/CommentThread'
import { useEndUser } from '@/hooks/useEndUser'
import type { HubPost } from '@/lib/types'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const { user, isLoading: authLoading } = useEndUser()

  const [post, setPost]       = useState<HubPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/hub/posts/${id}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setError(json.error)
        else setPost(json.data)
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false))
  }, [id])

  const currentUser = user
    ? {
        id: user.uid,
        name: user.displayName ?? user.email ?? 'You',
        avatarUrl: user.photoURL ?? null,
      }
    : null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button type="button" onClick={() => router.back()}
            aria-label="Go back"
            className="p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-muted-foreground)' }}>
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
            <Link href="/community"
              className="text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              style={{ color: 'var(--color-foreground)' }}>
              Repair Hub
            </Link>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>/ Post</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2" role="status" aria-live="polite">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
            <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading post…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border p-8 text-center"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-destructive)' }} aria-hidden />
            <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{error}</p>
            <Link href="/community" className="mt-4 inline-block text-sm font-semibold hover:underline"
              style={{ color: 'var(--color-primary)' }}>
              Back to feed
            </Link>
          </div>
        )}

        {/* Post */}
        {!loading && post && !error && (
          <>
            <PostCard
              post={post}
              viewerId={currentUser?.id}
              isAuthenticated={!!user}
              expanded
              onDelete={() => router.push('/community')}
            />

            {/* Comments */}
            <div className="rounded-2xl border overflow-hidden px-4 pt-4 pb-2"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-foreground)' }}>
                Comments
              </h2>

              {!authLoading && !user && (
                <div className="flex items-center justify-between gap-3 mb-4 p-3 rounded-xl border"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background-subtle)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    Sign in to join the conversation.
                  </p>
                  <Link href={`/user/sign-in?redirect=/community/post/${id}`}
                    className="btn-primary text-xs px-4 py-1.5 shrink-0">
                    Sign in
                  </Link>
                </div>
              )}

              <CommentThread
                postId={post.id}
                currentUser={currentUser}
                isAuthenticated={!!user}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
