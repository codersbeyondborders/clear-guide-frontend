'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Loader2, Save, Wrench } from 'lucide-react'
import type { HubPost, MediaAttachment } from '@/lib/types'
import { MediaUploader } from './MediaUploader'

interface PostEditModalProps {
  post: HubPost
  isOpen: boolean
  onClose: () => void
  onUpdated: (updatedPost: HubPost) => void
}

const DIFFICULTY_OPTIONS = ['Easy', 'Intermediate', 'Advanced', 'Pro']

export function PostEditModal({ post, isOpen, onClose, onUpdated }: PostEditModalProps) {
  const [body, setBody] = useState(post.body || '')
  const [media, setMedia] = useState<MediaAttachment[]>(post.media || [])
  const [productName, setProductName] = useState(post.productName || '')
  const [productBrand, setProductBrand] = useState(post.productBrand || '')
  const [linkUrl, setLinkUrl] = useState(post.linkUrl || '')
  const [difficulty, setDifficulty] = useState<string | null>(
    post.tags?.find(t => DIFFICULTY_OPTIONS.includes(t)) || null
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setBody(post.body || '')
      setMedia(post.media || [])
      setProductName(post.productName || '')
      setProductBrand(post.productBrand || '')
      setLinkUrl(post.linkUrl || '')
      setDifficulty(post.tags?.find(t => DIFFICULTY_OPTIONS.includes(t)) || null)
      setError('')
    }
  }, [isOpen, post])

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() && media.length === 0 && !linkUrl.trim()) {
      setError('Post cannot be empty')
      return
    }

    setSaving(true)
    setError('')

    const updatedTags = post.tags ? post.tags.filter(t => !DIFFICULTY_OPTIONS.includes(t)) : []
    if (difficulty) updatedTags.push(difficulty)

    try {
      const res = await fetch(`/api/hub/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: body.trim(),
          media,
          productName: productName.trim() || undefined,
          productBrand: productBrand.trim() || undefined,
          linkUrl: linkUrl.trim() || undefined,
          tags: updatedTags,
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error || 'Failed to update post')
        setSaving(false)
        return
      }

      onUpdated(json.data as HubPost)
      onClose()
    } catch (err) {
      setError('Network error, failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-post-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}>
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 id="edit-post-title" className="text-base font-bold flex items-center gap-2"
            style={{ color: 'var(--color-foreground)' }}>
            <Wrench className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
            Edit Post
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-muted-foreground)' }}>
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Post Text */}
          <div>
            <label htmlFor="edit-post-body" className="block text-xs font-semibold mb-1"
              style={{ color: 'var(--color-foreground)' }}>
              Post Content
            </label>
            <textarea
              id="edit-post-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              maxLength={4000}
              placeholder="Describe your repair guide or question…"
              className="w-full p-3 rounded-xl border text-sm outline-none resize-y leading-relaxed focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                backgroundColor: 'var(--color-background-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>

          {/* Difficulty Tag Selection */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-foreground)' }}>
              Repair Difficulty Level
            </label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map(opt => {
                const isSelected = difficulty === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDifficulty(isSelected ? null : opt)}
                    className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                    }}>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Linked Product & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-product-brand" className="block text-xs font-semibold mb-1"
                style={{ color: 'var(--color-foreground)' }}>
                Brand (Optional)
              </label>
              <input
                id="edit-product-brand"
                type="text"
                value={productBrand}
                onChange={e => setProductBrand(e.target.value)}
                placeholder="e.g. Apple, Dyson"
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: 'var(--color-background-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
              />
            </div>
            <div>
              <label htmlFor="edit-product-name" className="block text-xs font-semibold mb-1"
                style={{ color: 'var(--color-foreground)' }}>
                Product Model
              </label>
              <input
                id="edit-product-name"
                type="text"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="e.g. iPhone 13 Pro"
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: 'var(--color-background-subtle)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-foreground)',
                }}
              />
            </div>
          </div>

          {/* Link URL */}
          <div>
            <label htmlFor="edit-link-url" className="block text-xs font-semibold mb-1"
              style={{ color: 'var(--color-foreground)' }}>
              External Link / Reference URL
            </label>
            <input
              id="edit-link-url"
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="https://…"
              className="w-full px-3 py-2 rounded-xl border text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                backgroundColor: 'var(--color-background-subtle)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>

          {/* Media Attachments */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-foreground)' }}>
              Photos & Media
            </label>
            <MediaUploader attachments={media} onChange={setMedia} disabled={saving} />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium" style={{ color: 'var(--color-destructive)' }}>
              {error}
            </p>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t shrink-0"
            style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn-outline text-xs px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs px-5 py-2 gap-1.5">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              ) : (
                <Save className="w-3.5 h-3.5" aria-hidden />
              )}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
