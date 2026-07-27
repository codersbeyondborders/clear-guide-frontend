'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, Send, AlertCircle } from 'lucide-react'
import type { HubComment } from '@/lib/types'
import { LikeButton } from './EngagementButtons'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface CommentThreadProps {
  postId: string
  currentUser: { id: string; name: string; avatarUrl: string | null } | null
  isAuthenticated: boolean
}

function CommentItem({
  comment,
  depth,
  postId,
  currentUser,
  isAuthenticated,
  onReply,
}: {
  comment: HubComment
  depth: number
  postId: string
  currentUser: { id: string; name: string; avatarUrl: string | null } | null
  isAuthenticated: boolean
  onReply: (comment: HubComment) => void
}) {
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyBody, setReplyBody]       = useState('')
  const [posting, setPosting]           = useState(false)
  const [replies, setReplies]           = useState<HubComment[]>(comment.replies ?? [])

  async function submitReply(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim() || posting) return
    setPosting(true)
    const res = await fetch(`/api/hub/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: replyBody.trim(), parentId: comment.id }),
    })
    const json = await res.json()
    if (res.ok && json.data) {
      setReplies(p => [...p, json.data])
      onReply(json.data)
      setReplyBody('')
      setShowReplyBox(false)
    }
    setPosting(false)
  }

  const profileHref = comment.author.username ? `/u/${comment.author.username}` : `/u/${comment.userId}`
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  return (
    <div className={depth > 0 ? 'pl-10 border-l' : ''} style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex gap-3 py-3">
        <Link href={profileHref} aria-label={comment.author.name}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold select-none"
            style={{ background: 'var(--color-primary)', color: '#04140e' }}>
            {comment.author.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              : (comment.author.name[0] ?? 'U').toUpperCase()
            }
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <Link href={profileHref} className="text-xs font-semibold hover:underline focus-visible:outline-none"
              style={{ color: 'var(--color-foreground)' }}>
              {comment.author.name}
            </Link>
            {comment.author.username && (
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                @{comment.author.username}
              </span>
            )}
            <time dateTime={comment.createdAt} className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {timeAgo}
            </time>
          </div>
          <p className="text-sm mt-1 leading-relaxed text-pretty whitespace-pre-wrap break-words"
            style={{ color: 'var(--color-foreground)' }}>
            {comment.body}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <LikeButton
              targetType="comment"
              targetId={comment.id}
              initialCount={comment.likeCount}
              initialLiked={comment.isLiked ?? false}
              isAuthenticated={isAuthenticated}
            />
            {depth < 2 && (
              <button type="button" onClick={() => setShowReplyBox(p => !p)}
                className="text-xs px-2 py-1 rounded-full transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ color: 'var(--color-muted-foreground)' }}>
                Reply
              </button>
            )}
          </div>

          {showReplyBox && currentUser && (
            <form onSubmit={submitReply} className="mt-2 flex gap-2" aria-label="Write a reply">
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold select-none shrink-0"
                style={{ background: 'var(--color-primary)', color: '#04140e' }}>
                {currentUser.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : (currentUser.name[0] ?? 'U').toUpperCase()
                }
              </div>
              <div className="flex-1 flex gap-2 items-end border rounded-xl px-3 py-2"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background-subtle)' }}>
                <textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submitReply(e as unknown as React.FormEvent) } }}
                  placeholder="Write a reply…"
                  rows={1}
                  maxLength={2000}
                  aria-label="Reply body"
                  className="flex-1 resize-none bg-transparent text-xs outline-none leading-relaxed"
                  style={{ color: 'var(--color-foreground)', minHeight: 28 }}
                />
                <button type="submit" disabled={!replyBody.trim() || posting}
                  aria-label="Post reply"
                  className="shrink-0 p-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ color: replyBody.trim() ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      {replies.map(r => (
        <CommentItem key={r.id} comment={r} depth={depth + 1} postId={postId} currentUser={currentUser}
          isAuthenticated={isAuthenticated} onReply={onReply} />
      ))}
    </div>
  )
}

export function CommentThread({ postId, currentUser, isAuthenticated }: CommentThreadProps) {
  const { data, isLoading, error, mutate } = useSWR(`/api/hub/posts/${postId}/comments`, fetcher)
  const [body, setBody]       = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  const comments: HubComment[] = data?.data ?? []

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || posting) return
    setPosting(true)
    setPostError('')
    const res = await fetch(`/api/hub/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    })
    const json = await res.json()
    if (res.ok && json.data) {
      mutate({ data: [...comments, json.data], error: null }, false)
      setBody('')
    } else {
      setPostError(json.error ?? 'Failed to post comment')
    }
    setPosting(false)
  }

  return (
    <section aria-label="Comments" id="comments" className="mt-2">
      <h2 className="sr-only">Comments</h2>

      {/* Compose */}
      {currentUser && (
        <form onSubmit={submitComment} className="flex gap-3 mb-4" aria-label="Write a comment">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold select-none shrink-0"
            style={{ background: 'var(--color-primary)', color: '#04140e' }}>
            {currentUser.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
              : (currentUser.name[0] ?? 'U').toUpperCase()
            }
          </div>
          <div className="flex-1 border rounded-2xl px-4 py-3 flex gap-2 items-end"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background-subtle)' }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !(e.keyCode === 229))
                  { e.preventDefault(); submitComment(e as unknown as React.FormEvent) }
              }}
              placeholder="Add a comment…"
              rows={1}
              maxLength={2000}
              aria-label="Comment body"
              className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
              style={{ color: 'var(--color-foreground)', minHeight: 32 }}
            />
            <button type="submit" disabled={!body.trim() || posting}
              aria-label="Post comment"
              className="shrink-0 p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: body.trim() ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}>
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      )}

      {postError && (
        <p role="alert" className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--color-destructive)' }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {postError}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 gap-2" aria-live="polite">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
          <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading comments…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-center py-4" style={{ color: 'var(--color-destructive)' }}>
          Failed to load comments
        </p>
      )}

      {/* Comments */}
      {!isLoading && !error && comments.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
          No comments yet. Be the first!
        </p>
      )}

      {comments.map(c => (
        <CommentItem key={c.id} comment={c} depth={0} postId={postId} currentUser={currentUser}
          isAuthenticated={isAuthenticated} onReply={() => {}} />
      ))}
    </section>
  )
}
