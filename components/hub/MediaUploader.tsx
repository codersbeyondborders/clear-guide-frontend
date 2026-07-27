'use client'

import { useRef, useState } from 'react'
import { ImageIcon, Video, FileText, X, Loader2, AlertCircle } from 'lucide-react'
import type { MediaAttachment } from '@/lib/types'

interface MediaUploaderProps {
  attachments: MediaAttachment[]
  onChange: (attachments: MediaAttachment[]) => void
  maxFiles?: number
  disabled?: boolean
}

const ACCEPT = 'image/*,video/mp4,video/webm,video/quicktime,application/pdf,.doc,.docx'

function MediaPreview({ item, onRemove }: { item: MediaAttachment; onRemove: () => void }) {
  if (item.type === 'image') {
    return (
      <div className="relative group rounded-xl overflow-hidden" style={{ width: 96, height: 96, background: 'var(--color-background-subtle)', flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.name ?? 'attachment'} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className="absolute top-1 right-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
          style={{ background: 'rgba(15,23,42,0.75)', color: '#fff' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  const Icon = item.type === 'video' ? Video : FileText
  const label = item.type === 'video' ? 'Video' : 'Document'
  return (
    <div className="relative group flex flex-col items-center justify-center gap-1 rounded-xl border text-xs font-medium"
      style={{ width: 96, height: 96, background: 'var(--color-background-subtle)', borderColor: 'var(--color-border)', flexShrink: 0 }}>
      <Icon className="w-6 h-6" style={{ color: 'var(--color-primary)' }} aria-hidden />
      <span style={{ color: 'var(--color-muted-foreground)' }} className="truncate max-w-[80px] px-1">{item.name ?? label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.name ?? label}`}
        className="absolute top-1 right-1 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
        style={{ background: 'rgba(15,23,42,0.75)', color: '#fff' }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function MediaUploader({ attachments, onChange, maxFiles = 8, disabled }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    if (attachments.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }
    setError('')
    setUploading(true)

    const newAttachments: MediaAttachment[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/hub/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? 'Upload failed')
        setUploading(false)
        return
      }
      newAttachments.push(await res.json())
    }

    onChange([...attachments, ...newAttachments])
    setUploading(false)
  }

  const canAdd = attachments.length < maxFiles && !disabled

  return (
    <div className="space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list" aria-label="Attachments">
          {attachments.map((a, i) => (
            <div key={i} role="listitem">
              <MediaPreview item={a} onRemove={() => onChange(attachments.filter((_, j) => j !== i))} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept={ACCEPT} multiple className="sr-only"
          tabIndex={-1} aria-hidden
          onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
        />
        {canAdd && (
          <>
            <button type="button" aria-label="Add image"
              onClick={() => { inputRef.current!.accept = 'image/*'; inputRef.current!.click() }}
              disabled={uploading}
              className="btn-ghost text-xs gap-1 px-2 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: 'var(--color-muted-foreground)' }}>
              <ImageIcon className="w-4 h-4" aria-hidden />
              <span>Image</span>
            </button>
            <button type="button" aria-label="Add video"
              onClick={() => { inputRef.current!.accept = 'video/mp4,video/webm,video/quicktime'; inputRef.current!.click() }}
              disabled={uploading}
              className="btn-ghost text-xs gap-1 px-2 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: 'var(--color-muted-foreground)' }}>
              <Video className="w-4 h-4" aria-hidden />
              <span>Video</span>
            </button>
            <button type="button" aria-label="Add document"
              onClick={() => { inputRef.current!.accept = 'application/pdf,.doc,.docx'; inputRef.current!.click() }}
              disabled={uploading}
              className="btn-ghost text-xs gap-1 px-2 py-1.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: 'var(--color-muted-foreground)' }}>
              <FileText className="w-4 h-4" aria-hidden />
              <span>Doc</span>
            </button>
          </>
        )}
        {uploading && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden />
            Uploading…
          </span>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs" role="alert" style={{ color: 'var(--color-destructive)' }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
