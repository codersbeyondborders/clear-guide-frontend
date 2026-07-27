'use client'

import { useRef, useState } from 'react'
import { Link2, X, Loader2, Send } from 'lucide-react'
import { MediaUploader } from './MediaUploader'
import type { MediaAttachment, HubPost } from '@/lib/types'
import Link from 'next/link'

interface PostComposerProps {
  currentUser: { id: string; name: string; avatarUrl: string | null } | null
  onPost: (post: HubPost) => void
  manualId?: string
  placeholder?: string
}

const MAX_CHARS = 4000

export function PostComposer({ currentUser, onPost, manualId, placeholder }: PostComposerProps) {
  const [body, setBody]         = useState('')
  const [media, setMedia]       = useState<MediaAttachment[]>([])
  const [linkUrl, setLinkUrl]   = useState('')
  const [showLink, setShowLink] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const textRef = useRef<HTMLTextAreaElement>(null)

  const charCount    = body.length
  const overLimit    = charCount > MAX_CHARS
  const canSubmit    = (body.trim().length > 0 || media.length > 0 || linkUrl.trim().length > 0) && !overLimit && !submitting

  function autoResize() {
    const el = textRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 320)}px`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/hub/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim(), media, manualId: manualId ?? undefined, linkUrl: linkUrl.trim() || undefined }),
    })
    const json = await res.json()
    if (!res.ok || json.error) {
      setError(json.error ?? 'Failed to post')
      setSubmitting(false)
      return
    }
    onPost(json.data as HubPost)
    setBody(''); setMedia([]); setLinkUrl(''); setShowLink(false)
    if (textRef.current) textRef.current.style.height = 'auto'
    setSubmitting(false)
  }

  if (!currentUser) {
    return (
      <div className="rounded-2xl border p-5 flex items-center justify-between gap-4"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Sign in to share a repair tip, ask a question, or post a fix.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/user/sign-in" className="btn-primary text-xs px-4 py-2">Sign in</Link>
          <Link href="/user/sign-up" className="btn-outline text-xs px-4 py-2">Sign up</Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} aria-label="New post">
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex gap-3 p-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold select-none"
            style={{ background: 'var(--color-primary)', color: '#04140e' }}
            aria-hidden>
            {currentUser.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
              : currentUser.name[0]?.toUpperCase()
            }
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textRef}
              value={body}
              onChange={e => { setBody(e.target.value); autoResize() }}
              placeholder={placeholder ?? "Share a repair tip, question, or fix…"}
              aria-label="Post body"
              rows={2}
              className="w-full resize-none bg-transparent text-sm outline-none leading-relaxed"
              style={{
                color: 'var(--color-foreground)',
                minHeight: 48,
                borderBottom: body.length > 0 ? `1px solid var(--color-border)` : 'none',
                paddingBottom: body.length > 0 ? 12 : 0,
              }}
            />

            {/* Media attachments */}
            {(media.length > 0 || body.length > 0) && (
              <div className="mt-3">
                <MediaUploader attachments={media} onChange={setMedia} disabled={submitting} />
              </div>
            )}

            {/* Link input */}
            {showLink && (
              <div className="mt-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                  aria-label="Link URL"
                  className="flex-1 text-sm bg-transparent outline-none"
                  style={{ color: 'var(--color-foreground)' }}
                />
                <button type="button" onClick={() => { setShowLink(false); setLinkUrl('') }} aria-label="Remove link">
                  <X className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-2">
          <div className="flex items-center gap-1">
            {body.length === 0 && media.length === 0 && (
              <MediaUploader attachments={media} onChange={setMedia} disabled={submitting} />
            )}
            {!showLink && (
              <button type="button" onClick={() => setShowLink(true)}
                className="btn-ghost text-xs gap-1 px-2 py-1.5 rounded-lg"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-label="Add link">
                <Link2 className="w-4 h-4" aria-hidden />
                <span>Link</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-xs tabular-nums"
              aria-live="polite"
              style={{ color: overLimit ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}>
              {charCount}/{MAX_CHARS}
            </span>
            <button type="submit" disabled={!canSubmit}
              className="btn-primary text-xs px-4 py-2 gap-1.5 rounded-xl"
              aria-label="Post">
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                : <Send className="w-3.5 h-3.5" aria-hidden />}
              Post
            </button>
          </div>
        </div>

        {error && (
          <p className="px-4 pb-3 text-xs" role="alert" style={{ color: 'var(--color-destructive)' }}>{error}</p>
        )}
      </div>
    </form>
  )
}
