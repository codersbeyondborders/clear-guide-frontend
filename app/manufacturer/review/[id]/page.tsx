'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Loader2, ClipboardCheck, CheckCircle2, XCircle, ChevronLeft,
  Globe, Upload, LayoutList, FileText, AlertTriangle, Video
} from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useAuth } from '@/hooks/useAuth'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ManualSection {
  id: string
  sectionNumber: number
  title: string
  content: string
}

interface ManualDetail {
  id: string
  productName: string
  productModel: string
  brand: string
  serialNumber: string | null
  status: string
  languages: string[]
  uploadMethod: string
  uploadedFileName?: string
  sections: ManualSection[]
  createdAt: string
  updatedAt: string
  videoGenerationStatus?: string // 'none' | 'pending' | 'completed' | 'error'
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function getInitials(name: string) {
  return name.split(/[\s@]/).filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'MF'
}

// ---------------------------------------------------------------------------
// Section preview card
// ---------------------------------------------------------------------------
function SectionCard({ section }: { section: ManualSection }) {
  const [expanded, setExpanded] = useState(false)
  const preview = section.content?.slice(0, 240) ?? ''
  const long = (section.content?.length ?? 0) > 240

  return (
    <article
      className="rounded-xl border p-5 space-y-2"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
          <span className="text-xs font-normal mr-2" style={{ color: 'var(--color-muted-foreground)' }}>
            #{section.sectionNumber}
          </span>
          {section.title}
        </h3>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
        {expanded ? section.content : preview}
        {long && !expanded && '…'}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          style={{ color: 'var(--color-primary)' }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </article>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()

  const [manual, setManual] = useState<ManualDetail | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionDone, setActionDone] = useState<'approved' | 'rejected' | null>(null)
  
  const [generatingVideo, setGeneratingVideo] = useState(false)

  const MAX_NOTES = 1000

  // Derived display name
  const displayName: string = (
    user?.displayName ??
    user?.email ??
    'Manufacturer'
  ) as string
  const initials = getInitials(displayName)

  useEffect(() => {
    if (!id) return

    let pollInterval: NodeJS.Timeout

    const fetchManual = () => {
      fetch(`/api/manuals/${id}`)
        .then(async (res) => {
          if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed to load manual')
          return res.json()
        })
        .then((data) => { 
          setManual(data)
          setLoading(false)
          
          if (data.status === 'pending' || data.videoGenerationStatus === 'pending') {
            // Poll every 3 seconds if still pending
            pollInterval = setTimeout(fetchManual, 3000)
          }
        })
        .catch((err) => { 
          setLoadError(err.message)
          setLoading(false) 
        })
    }

    fetchManual()

    return () => {
      if (pollInterval) clearTimeout(pollInterval)
    }
  }, [id])

  async function patchStatus(newStatus: 'published' | 'draft', notes?: string) {
    setActionError('')
    setActionLoading(true)
    try {
      const res = await fetch(`/api/manuals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(notes ? { reviewNotes: notes } : {}),
        }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Failed to update status')
      setActionDone(newStatus === 'published' ? 'approved' : 'rejected')
      setTimeout(() => router.push('/manufacturer/dashboard'), 2200)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setActionLoading(false)
    }
  }

  async function generateVideo() {
    setGeneratingVideo(true)
    try {
      const res = await fetch(`/api/manuals/generate-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualId: manual?.id,
          procedureTitle: manual?.productName,
          repairSteps: manual?.sections.map(s => s.title)
        }),
      })
      if (!res.ok) throw new Error('Failed to request video generation')
      
      // Update local state to trigger polling
      setManual(m => m ? { ...m, videoGenerationStatus: 'pending' } : null)
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingVideo(false)
    }
  }

  // ── Loading / error ───────────────────────────────────────────────────────
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
      </div>
    )
  }

  if (loadError) {
    return (
      <DashboardShell displayName={displayName} initials={initials} onLogout={logout}>
        <div
          role="alert"
          className="px-4 py-3 rounded-xl border text-sm flex items-center gap-2 max-w-md"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
            color: 'var(--color-destructive)',
            borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {loadError}
        </div>
      </DashboardShell>
    )
  }

  if (actionDone) {
    return (
      <DashboardShell displayName={displayName} initials={initials} onLogout={logout}>
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
          {actionDone === 'approved' ? (
            <CheckCircle2 className="w-14 h-14" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          ) : (
            <XCircle className="w-14 h-14" style={{ color: '#d97706' }} aria-hidden="true" />
          )}
          <div className="space-y-1">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              {actionDone === 'approved' ? 'Manual approved and published!' : 'Changes requested'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              {actionDone === 'approved'
                ? 'The manual is now live. Redirecting to dashboard…'
                : 'The manual has been sent back to draft with your notes. Redirecting…'}
            </p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!manual) return null

  const additionalLangs = manual.languages.filter((l) => l !== 'en')

  return (
    <DashboardShell displayName={displayName} initials={initials} onLogout={logout}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>
        <div
          className="flex items-center gap-2 ml-2 px-3 py-1 rounded-full border text-xs font-semibold"
          style={{
            backgroundColor: 'color-mix(in srgb, #f59e0b 10%, transparent)',
            borderColor: '#f59e0b40',
            color: '#d97706',
          }}
        >
          <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Pending Review
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_340px] gap-6">

        {/* Left: manual content */}
        <div className="space-y-6 min-w-0">

          {/* Summary card */}
          <section
            className="rounded-2xl border p-6 space-y-5"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            aria-labelledby="review-summary-heading"
          >
            <h1 id="review-summary-heading" className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              {manual.productName}
            </h1>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Model',    value: manual.productModel },
                { label: 'Brand',    value: manual.brand },
                { label: 'Serial #', value: manual.serialNumber ?? '—' },
                { label: 'Status',   value: manual.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-muted-foreground)' }}>{label}</p>
                  <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-foreground)' }}>{value}</p>
                </div>
              ))}
            </div>
            <div
              className="pt-4 border-t flex flex-wrap gap-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                  {manual.languages.length} {manual.languages.length === 1 ? 'language' : 'languages'}
                  {additionalLangs.length > 0 && (
                    <span style={{ color: 'var(--color-muted-foreground)' }}> (+{additionalLangs.length} AI translated)</span>
                  )}
                </span>
              </div>
              {manual.uploadMethod === 'upload' && (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                  <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>Uploaded file</span>
                </div>
              )}
              {manual.uploadMethod === 'sections' && (
                <div className="flex items-center gap-2">
                  <LayoutList className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden="true" />
                  <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                    {manual.sections.length} {manual.sections.length === 1 ? 'section' : 'sections'}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Sections preview */}
          {manual.sections.length > 0 && (
            <section aria-labelledby="sections-preview-heading">
              <h2 id="sections-preview-heading" className="text-base font-bold mb-4" style={{ color: 'var(--color-foreground)' }}>
                Content preview
              </h2>
              <div className="space-y-3">
                {manual.sections.map((s) => (
                  <SectionCard key={s.id} section={s} />
                ))}
              </div>
            </section>
          )}

          {manual.sections.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-14 rounded-2xl border gap-4 text-center"
              style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
            >
              {manual.status === 'pending' ? (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 blur-2xl rounded-full opacity-50 scale-150"></div>
                    <Loader2 className="w-12 h-12 animate-spin relative z-10" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--color-foreground)' }}>AI is parsing your manual...</h3>
                    <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      This usually takes a few seconds. We're extracting text, sections, and images.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <FileText className="w-10 h-10 opacity-30" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                    No sections to preview for this manual.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: sticky action bar */}
        <aside className="xl:sticky xl:top-6 h-fit space-y-4">
          <div
            className="rounded-2xl border p-5 space-y-5"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="space-y-0.5">
              <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Review decision</h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
                Approve to publish immediately, or request changes to send it back to draft.
              </p>
            </div>

            <div
              className="border-t"
              style={{ borderColor: 'var(--color-border)' }}
              aria-hidden="true"
            />

            {actionError && (
              <div
                role="alert"
                aria-live="polite"
                className="px-3 py-2.5 rounded-lg border text-xs"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
                  color: 'var(--color-destructive)',
                  borderColor: 'color-mix(in srgb, var(--color-destructive) 20%, transparent)',
                }}
              >
                {actionError}
              </div>
            )}

            {/* Approve */}
            <button
              type="button"
              onClick={() => patchStatus('published')}
              disabled={actionLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              )}
              Approve & Publish
            </button>

            {/* Request changes */}
            {!showRejectModal ? (
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                style={{
                  borderColor: '#d9770640',
                  color: '#d97706',
                  backgroundColor: 'color-mix(in srgb, #f59e0b 8%, transparent)',
                }}
              >
                <XCircle className="w-4 h-4" aria-hidden="true" />
                Request Changes
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="reject-notes" className="block text-xs font-medium" style={{ color: 'var(--color-foreground)' }}>
                      Review notes <span aria-hidden="true" style={{ color: 'var(--color-destructive)' }}>*</span>
                    </label>
                    <span
                      className="text-xs"
                      aria-live="polite"
                      style={{ color: rejectNotes.length > MAX_NOTES * 0.9 ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}
                    >
                      {rejectNotes.length}/{MAX_NOTES}
                    </span>
                  </div>
                  <textarea
                    id="reject-notes"
                    value={rejectNotes}
                    onChange={(e) => { if (e.target.value.length <= MAX_NOTES) setRejectNotes(e.target.value) }}
                    rows={4}
                    placeholder="Describe what needs to be changed…"
                    className="auth-input resize-none w-full text-sm"
                    aria-describedby="reject-notes-hint"
                  />
                  <p id="reject-notes-hint" className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                    The creator will see these notes in their draft.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowRejectModal(false); setRejectNotes('') }}
                    className="flex-1 py-2 px-3 rounded-lg border text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => patchStatus('draft', rejectNotes)}
                    disabled={actionLoading || !rejectNotes.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                    style={{ backgroundColor: '#d97706', color: 'white' }}
                  >
                    {actionLoading && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                    Send Back to Draft
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Meta info */}
          <div
            className="rounded-xl border p-4 space-y-2"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted-foreground)' }}>
              Submission details
            </p>
            {[
              { label: 'Submitted', value: new Date(manual.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { label: 'Sections',  value: String(manual.sections.length) },
              { label: 'Languages', value: manual.languages.join(', ').toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
                <span className="font-medium" style={{ color: 'var(--color-foreground)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* AI Video Walkthrough */}
          <div
            className="rounded-xl border p-4 space-y-4"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="space-y-1">
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>AI Video Walkthrough</h2>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
                Generate step-by-step interactive animations with voiceovers for this manual.
              </p>
            </div>
            
            {manual.videoGenerationStatus === 'completed' && (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                <CheckCircle2 className="w-4 h-4" />
                Video generated successfully
              </div>
            )}
            
            {manual.videoGenerationStatus === 'pending' && (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is generating video...
              </div>
            )}
            
            {(!manual.videoGenerationStatus || manual.videoGenerationStatus === 'none' || manual.videoGenerationStatus === 'error') && (
              <button
                type="button"
                onClick={generateVideo}
                disabled={generatingVideo || manual.status === 'pending'}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-background-subtle)', color: 'var(--color-foreground)', borderColor: 'var(--color-border)' }}
              >
                {generatingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                Generate Video
              </button>
            )}
            
            {manual.videoGenerationStatus === 'error' && (
              <p className="text-xs" style={{ color: 'var(--color-destructive)' }}>Video generation failed. Please try again.</p>
            )}
          </div>
        </aside>
      </div>
    </DashboardShell>
  )
}
