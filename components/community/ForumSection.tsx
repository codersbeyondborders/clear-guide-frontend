'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Loader2, AlertCircle, Plus, Rss, MessageCircle } from 'lucide-react'
import { ThreadCard } from './ThreadCard'
import { GuestBanner } from './GuestBanner'
import { PostFeed } from '@/components/hub/PostFeed'
import type { ForumThread } from '@/lib/types'
import type { User } from 'firebase/auth'
import { authFetch } from "@/lib/apiClient"

// ---------------------------------------------------------------------------
// Mock data — mirrors a real DB payload
// ---------------------------------------------------------------------------
const MOCK_THREADS: ForumThread[] = [
  {
    id: 'mock-t1',
    manualId: '',
    userId: 'u1',
    title: 'Section 4 — step 7 references the wrong diagram',
    body: 'The diagram referenced as "Fig. 4-7" appears to actually be Fig. 4-8. Has anyone else confirmed this? Took me 20 minutes to figure out.',
    isPinned: false,
    isSolved: true,
    replyCount: 6,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    author: { name: 'Marcus L.', image: null },
  },
  {
    id: 'mock-t2',
    manualId: '',
    userId: 'u2',
    title: 'Calibration mode not working after firmware update',
    body: 'After updating to firmware 2.3, the calibration procedure described in Section 6 no longer works. The button sequence seems to have changed.',
    isPinned: true,
    isSolved: false,
    replyCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    author: { name: 'Aiko T.', image: null },
  },
  {
    id: 'mock-t3',
    manualId: '',
    userId: 'u3',
    title: 'Anyone have a checklist for the maintenance schedule?',
    body: 'The manual mentions quarterly maintenance but doesn\'t provide a clear checklist format. Happy to share what I\'ve put together if anyone wants it.',
    isPinned: false,
    isSolved: false,
    replyCount: 3,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    author: { name: 'Elena R.', image: null },
  },
]

// ---------------------------------------------------------------------------
// New Thread Form
// ---------------------------------------------------------------------------
function NewThreadForm({ manualId, onSubmitted }: { manualId: string; onSubmitted: () => void }) {
  const [open, setOpen]     = useState(false)
  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const TITLE_LIMIT = 120
  const BODY_LIMIT  = 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Thread title is required.'); return }
    if (!body.trim())  { setError('Please add some details to your thread.'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await authFetch('/api/community/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualId, title: title.trim(), body: body.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to create thread')
      onSubmitted()
      setOpen(false)
      setTitle(''); setBody('')
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
        <Plus className="w-4 h-4" aria-hidden="true" />
        New thread
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      aria-label="New discussion thread form"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Start a discussion</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          style={{ color: 'var(--color-muted-foreground)' }}
          aria-label="Cancel new thread"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="thread-title" className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
            Title <span aria-hidden="true">*</span>
          </label>
          <span
            aria-live="polite"
            className="text-xs tabular-nums"
            style={{ color: title.length > TITLE_LIMIT * 0.9 ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}
          >
            {title.length}/{TITLE_LIMIT}
          </span>
        </div>
        <input
          id="thread-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value.slice(0, TITLE_LIMIT))}
          placeholder="What's your question or topic?"
          className="auth-input text-sm"
          style={{
            height: '36px',
            borderColor: title.length >= TITLE_LIMIT ? 'var(--color-destructive)' : undefined,
          }}
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="thread-body" className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
            Details <span aria-hidden="true">*</span>
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
          id="thread-body"
          value={body}
          onChange={e => setBody(e.target.value.slice(0, BODY_LIMIT))}
          rows={5}
          placeholder="Describe your issue or question in detail…"
          className="auth-input text-sm resize-none leading-relaxed"
          style={{ borderColor: body.length >= BODY_LIMIT ? 'var(--color-destructive)' : undefined }}
          required
        />
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !title.trim() || !body.trim()}
        className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        Post thread
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// ForumSection (main export)
// ---------------------------------------------------------------------------
interface ForumSectionProps {
  manualId: string
  user: User | null
  currentPath: string
}

const fetcher = (url: string) => authFetch(url).then(r => r.json())

export function ForumSection({ manualId, user, currentPath }: ForumSectionProps) {
  const swrKey = `/api/community/threads?manualId=${manualId}`
  const { data, error, isLoading } = useSWR<{ data: ForumThread[] }>(swrKey, fetcher, {
    fallbackData: { data: MOCK_THREADS.map(t => ({ ...t, manualId })) },
    revalidateOnFocus: false,
  })

  const threads = data?.data ?? []

  const currentUser = user
    ? {
        id: user.uid,
        name: user.displayName ?? user.email ?? 'You',
        avatarUrl: user.photoURL ?? null,
      }
    : null

  return (
    <div className="flex flex-col gap-6" aria-label="Discussion forum">

      {/* ── Hub Posts ──────────────────────────────────────────────── */}
      <section aria-labelledby="hub-posts-heading">
        <div className="flex items-center gap-2 mb-3">
          <Rss className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
          <h3 id="hub-posts-heading" className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
            Community Posts
          </h3>
        </div>
        <p className="text-xs mb-3" style={{ color: 'var(--color-muted-foreground)' }}>
          Share photos, videos, tips, or links related to this product.
        </p>
        <PostFeed
          manualId={manualId}
          currentUser={currentUser}
          isAuthenticated={!!user}
        />
      </section>

      {/* ── Discussion Threads ─────────────────────────────────────── */}
      <section aria-labelledby="threads-heading">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
            <h3 id="threads-heading" className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>
              Discussion Threads
            </h3>
            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              ({threads.length})
            </span>
          </div>
          {user && (
            <NewThreadForm manualId={manualId} onSubmitted={() => mutate(swrKey)} />
          )}
        </div>

        {/* Guest CTA */}
        {!user && (
          <GuestBanner
            message="Sign in to start a discussion or ask a question."
            returnTo={currentPath}
          />
        )}

        {/* Thread list */}
        {isLoading && (
          <div className="flex justify-center py-6" role="status" aria-label="Loading threads">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
          </div>
        )}
        {error && (
          <div
            className="flex items-center gap-2 text-sm p-3 rounded-xl border"
            style={{ borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' }}
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Failed to load threads.
          </div>
        )}
        {!isLoading && threads.length === 0 && (
          <p className="text-sm text-center py-6" style={{ color: 'var(--color-muted-foreground)' }}>
            No threads yet. Start the first discussion.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {threads.map(t => (
            <ThreadCard key={t.id} thread={t} manualId={manualId} />
          ))}
        </div>
      </section>
    </div>
  )
}
