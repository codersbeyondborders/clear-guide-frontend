'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, MessageCircle, Loader2,
  AlertCircle, Pin, SendHorizonal,
} from 'lucide-react'
import { useEndUser } from '@/hooks/useEndUser'
import { GuestBanner } from '@/components/community/GuestBanner'
import type { ForumThread, ForumReply } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
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

function Avatar({ name, image }: { name?: string; image?: string | null }) {
  const initials = name ? name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) : 'U'
  return (
    <div
      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
      style={{ backgroundColor: 'var(--color-primary)' }}
      aria-hidden="true"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="w-full h-full rounded-full object-cover" />
      ) : initials}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const MOCK_DATA = {
  thread: {
    id: 'mock-t1',
    manualId: '',
    userId: 'u1',
    title: 'Calibration mode not working after firmware update',
    body: 'After updating to firmware 2.3, the calibration procedure described in Section 6 no longer works. The button sequence seems to have changed. Has anyone found a workaround?',
    isPinned: true,
    isSolved: false,
    replyCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    author: { name: 'Aiko T.', image: null },
    manualName: 'Product Manual',
    productBrand: null,
  } as ForumThread & { manualName: string | null; productBrand: string | null },
  replies: [
    {
      id: 'mock-r1',
      threadId: 'mock-t1',
      userId: 'u2',
      body: 'I had the same issue. The new button sequence for firmware 2.3 is: hold MENU + UP for 3 seconds instead of just MENU. Not documented yet but the manufacturer confirmed on Twitter.',
      isSolution: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
      author: { name: 'Marcus L.', image: null },
    },
    {
      id: 'mock-r2',
      threadId: 'mock-t1',
      userId: 'u3',
      body: 'Confirmed — the MENU + UP sequence works for me on firmware 2.3.1 as well. Thanks Marcus!',
      isSolution: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      author: { name: 'Elena R.', image: null },
    },
  ] as ForumReply[],
}

// ---------------------------------------------------------------------------
// Reply card
// ---------------------------------------------------------------------------
function ReplyCard({
  reply,
  isThreadOwner,
  threadId,
  manualId,
  onMarkSolution,
}: {
  reply: ForumReply
  isThreadOwner: boolean
  threadId: string
  manualId: string
  onMarkSolution: (replyId: string) => void
}) {
  const [marking, setMarking] = useState(false)

  const handleMark = async () => {
    setMarking(true)
    await fetch(`/api/community/threads/${threadId}/replies/${reply.id}/solution`, { method: 'PATCH' })
    onMarkSolution(reply.id)
    setMarking(false)
  }

  return (
    <article
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{
        backgroundColor: reply.isSolution
          ? 'color-mix(in srgb, var(--color-primary) 6%, var(--color-card))'
          : 'var(--color-card)',
        borderColor: reply.isSolution ? 'var(--color-primary)' : 'var(--color-border)',
      }}
    >
      {reply.isSolution && (
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--color-primary)' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          Accepted Solution
        </span>
      )}

      <div className="flex items-start gap-3">
        <Avatar name={reply.author?.name} image={reply.author?.image} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
              {reply.author?.name ?? 'Anonymous'}
            </span>
            <time dateTime={reply.createdAt} className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {relativeTime(reply.createdAt)}
            </time>
          </div>
          <p className="text-sm mt-2 leading-relaxed text-pretty" style={{ color: 'var(--color-foreground)' }}>
            {reply.body}
          </p>
        </div>
      </div>

      {isThreadOwner && !reply.isSolution && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleMark}
            disabled={marking}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'transparent' }}
          >
            {marking ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="w-3 h-3" aria-hidden="true" />}
            Mark as solution
          </button>
        </div>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Reply form
// ---------------------------------------------------------------------------
function ReplyForm({ threadId, onPosted }: { threadId: string; onPosted: () => void }) {
  const [body, setBody]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const LIMIT = 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/community/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to post reply')
      setBody('')
      onPosted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3" aria-label="Post a reply">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label htmlFor="reply-body" className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
            Your reply
          </label>
          <span
            aria-live="polite"
            className="text-xs tabular-nums"
            style={{ color: body.length > LIMIT * 0.9 ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}
          >
            {body.length}/{LIMIT}
          </span>
        </div>
        <textarea
          id="reply-body"
          value={body}
          onChange={e => setBody(e.target.value.slice(0, LIMIT))}
          rows={4}
          placeholder="Share your knowledge or ask for more details…"
          className="auth-input text-sm resize-none leading-relaxed"
          style={{ borderColor: body.length >= LIMIT ? 'var(--color-destructive)' : undefined }}
        />
      </div>
      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="inline-flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <SendHorizonal className="w-4 h-4" aria-hidden="true" />}
          Post reply
        </button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ThreadDetailPage() {
  const params   = useParams()
  const manualId = params.id as string
  const threadId = params.threadId as string
  const { user } = useEndUser()

  const swrKey = `/api/community/threads/${threadId}`
  const { data, error, isLoading } = useSWR<{
    data: { thread: ForumThread & { manualName: string | null; productBrand: string | null }; replies: ForumReply[] } | null
    error: string | null
  }>(swrKey, fetcher, {
    fallbackData: { data: { thread: { ...MOCK_DATA.thread, manualId }, replies: MOCK_DATA.replies }, error: null },
    revalidateOnFocus: false,
  })

  const thread  = data?.data?.thread ?? null
  const replies = data?.data?.replies ?? []

  const isThreadOwner = !!user && thread?.userId === user.id

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }} role="status">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <AlertCircle className="w-8 h-8" style={{ color: 'var(--color-destructive)' }} aria-hidden="true" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Thread not found.</p>
        <Link href={`/manual/${manualId}`} className="text-sm text-primary hover:underline">Back to manual</Link>
      </div>
    )
  }

  const currentPath = `/manual/${manualId}/forum/${threadId}`

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>

      {/* Header */}
      <header
        className="border-b sticky top-0 z-20"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            href={`/manual/${manualId}`}
            className="inline-flex items-center gap-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to manual</span>
          </Link>
          {!user && (
            <a
              href={`/user/sign-in?returnTo=${encodeURIComponent(currentPath)}`}
              className="inline-flex items-center h-8 px-3 rounded-xl border text-xs font-semibold"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}
            >
              Sign in
            </a>
          )}
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Thread header */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="h-1.5 w-full" style={{ backgroundColor: 'var(--color-primary)' }} aria-hidden="true" />
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start gap-2 flex-wrap">
              {thread.isPinned && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                >
                  <Pin className="w-3 h-3" aria-hidden="true" />
                  Pinned
                </span>
              )}
              {thread.isSolved && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' }}
                >
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                  Solved
                </span>
              )}
              {thread.manualName && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)', backgroundColor: 'var(--color-background-subtle)' }}
                >
                  {thread.manualName}
                </span>
              )}
            </div>

            <h1 className="text-xl font-bold text-balance leading-snug" style={{ color: 'var(--color-foreground)' }}>
              {thread.title}
            </h1>

            <div className="flex items-center gap-3">
              <Avatar name={thread.author?.name} image={thread.author?.image} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {thread.author?.name ?? 'Anonymous'}
                </p>
                <time dateTime={thread.createdAt} className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                  {relativeTime(thread.createdAt)}
                </time>
              </div>
              <span className="flex items-center gap-1 ml-auto text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                {replies.length} repl{replies.length !== 1 ? 'ies' : 'y'}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-pretty" style={{ color: 'var(--color-foreground)' }}>
              {thread.body}
            </p>
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <section aria-labelledby="replies-heading">
            <h2 id="replies-heading" className="sr-only">Replies</h2>
            <div className="flex flex-col gap-3">
              {replies.map(r => (
                <ReplyCard
                  key={r.id}
                  reply={r}
                  isThreadOwner={isThreadOwner}
                  threadId={threadId}
                  manualId={manualId}
                  onMarkSolution={() => mutate(swrKey)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Reply form / guest CTA */}
        <section
          aria-labelledby="reply-heading"
          className="rounded-2xl border p-5"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <h2 id="reply-heading" className="text-sm font-semibold mb-4" style={{ color: 'var(--color-foreground)' }}>
            {user ? 'Leave a reply' : 'Join the discussion'}
          </h2>
          {user ? (
            <ReplyForm threadId={threadId} onPosted={() => mutate(swrKey)} />
          ) : (
            <GuestBanner
              message="Sign in to reply and help others in the community."
              returnTo={currentPath}
            />
          )}
        </section>

      </main>

      <footer
        className="border-t py-5 mt-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}
      >
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Powered by <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>ClearGuide</span>
          </p>
          <Link
            href="/community"
            className="text-xs font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Community hub
          </Link>
        </div>
      </footer>

    </div>
  )
}
