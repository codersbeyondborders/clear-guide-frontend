'use client'

import { useRef, useState } from 'react'
import {
  Plus, Trash2, GripVertical, Upload, X, FileText, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { Section } from '@/context/ManualEditorContext'

// ---------------------------------------------------------------------------
// Section Builder
// ---------------------------------------------------------------------------
interface SectionBuilderProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
}

function generateId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function SectionItem({
  section,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  section: Section
  index: number
  total: number
  onChange: (s: Section) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const MAX_CONTENT = 5000

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background-subtle)' }}
      >
        <GripVertical
          className="w-4 h-4 shrink-0 cursor-grab"
          style={{ color: 'var(--color-muted-foreground)' }}
          aria-hidden="true"
        />
        <span className="text-xs font-semibold" style={{ color: 'var(--color-muted-foreground)' }}>
          Section {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={section.title}
            onChange={(e) => onChange({ ...section, title: e.target.value })}
            placeholder="Section title"
            aria-label={`Title for section ${index + 1}`}
            className="w-full text-sm font-semibold bg-transparent border-none outline-none"
            style={{ color: 'var(--color-foreground)' }}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
            aria-label={`Move section ${index + 1} up`}
          >
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30"
            aria-label={`Move section ${index + 1} down`}
          >
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand section' : 'Collapse section'}
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Delete section ${index + 1}`}
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Section body */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`content-${section.id}`}
                className="block text-xs font-medium"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                Content
              </label>
              <span
                className="text-xs"
                aria-live="polite"
                style={{
                  color: section.content.length > MAX_CONTENT * 0.9
                    ? 'var(--color-destructive)'
                    : 'var(--color-muted-foreground)',
                }}
              >
                {section.content.length} / {MAX_CONTENT}
              </span>
            </div>
            <textarea
              id={`content-${section.id}`}
              value={section.content}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CONTENT) {
                  onChange({ ...section, content: e.target.value })
                }
              }}
              rows={5}
              placeholder="Describe this section in detail..."
              className="auth-input resize-y"
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function SectionBuilder({ sections, onChange }: SectionBuilderProps) {
  const addSection = () => {
    onChange([
      ...sections,
      { id: generateId(), title: '', content: '', imageUrls: [], videoUrls: [] },
    ])
  }

  const updateSection = (index: number, updated: Section) => {
    const next = [...sections]
    next[index] = updated
    onChange(next)
  }

  const deleteSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const next = [...sections]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return
    const next = [...sections]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <SectionItem
          key={section.id}
          section={section}
          index={i}
          total={sections.length}
          onChange={(s) => updateSection(i, s)}
          onDelete={() => deleteSection(i)}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
        />
      ))}
      <button
        type="button"
        onClick={addSection}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          borderColor: 'var(--color-border-strong)',
          color: 'var(--color-muted-foreground)',
        }}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add Section
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// File Upload Drop Zone
// ---------------------------------------------------------------------------
interface FileUploadProps {
  onFile: (name: string, size: number, pathname?: string) => void
  currentFileName: string | null
  onClear: () => void
  manualId?: string
}

export function FileUpload({ onFile, currentFileName, onClear, manualId = 'new' }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setUploadError('Only PDF and Word documents are accepted.')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size must be under 50 MB.')
      return
    }
    setUploadError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('manualId', manualId)
      formData.append('type', 'manual')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? 'Upload failed')
      }

      const data = await res.json() as { pathname?: string }
      onFile(file.name, file.size, data.pathname)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (currentFileName) {
    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl border"
        style={{ backgroundColor: 'var(--color-primary-subtle)', borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)' }}
      >
        <FileText className="w-8 h-8 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>
            {currentFileName}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Remove file"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        onDragEnter={(e) => { e.preventDefault(); if (!uploading) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file && !uploading) handleFile(file)
        }}
        onClick={() => { if (!uploading) inputRef.current?.click() }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !uploading) inputRef.current?.click() }}
        aria-label="Upload PDF or Word document, max 50 MB"
        aria-busy={uploading}
        className="flex flex-col items-center justify-center gap-3 py-12 px-6 rounded-xl border-2 border-dashed transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{
          borderColor: dragging ? 'var(--color-primary)' : uploadError ? 'var(--color-destructive)' : 'var(--color-border-strong)',
          backgroundColor: dragging ? 'var(--color-primary-subtle)' : 'var(--color-background-subtle)',
          cursor: uploading ? 'wait' : 'pointer',
        }}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} aria-hidden="true" />
            <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>Uploading...</p>
          </>
        ) : (
          <>
            <Upload
              className="w-8 h-8"
              style={{ color: dragging ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
                Drop your file here, or <span style={{ color: 'var(--color-primary)' }}>browse</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                PDF or Word document &mdash; max 50 MB
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
      {uploadError && (
        <p className="text-xs" role="alert" style={{ color: 'var(--color-destructive)' }}>
          {uploadError}
        </p>
      )}
    </div>
  )
}
