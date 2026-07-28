'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Loader2, Users } from 'lucide-react'
import { FollowButton } from './EngagementButtons'

interface UserSummary {
  id: string
  name: string
  username?: string | null
  avatarUrl?: string | null
  bio?: string | null
  isFollowing?: boolean
}

interface FollowersModalProps {
  userId: string
  type: 'followers' | 'following'
  isOpen: boolean
  viewerId?: string
  isAuthenticated: boolean
  onClose: () => void
}

export function FollowersModal({
  userId,
  type,
  isOpen,
  viewerId,
  isAuthenticated,
  onClose,
}: FollowersModalProps) {
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !userId) return
    setLoading(true)
    setError('')

    fetch(`/api/hub/profiles/${userId}/${type}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setError(json.error)
        else setUsers(json.data || [])
      })
      .catch(() => setError('Failed to load list'))
      .finally(() => setLoading(false))
  }, [isOpen, userId, type])

  if (!isOpen) return null

  const title = type === 'followers' ? 'Followers' : 'Following'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="followers-modal-title"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}>
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}>
          <h2 id="followers-modal-title" className="text-base font-bold flex items-center gap-2"
            style={{ color: 'var(--color-foreground)' }}>
            <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden />
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full transition-colors hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-muted-foreground)' }}>
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2" role="status">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
              <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Loading {type}…</span>
            </div>
          )}

          {!loading && error && (
            <p className="text-xs text-center py-8" style={{ color: 'var(--color-destructive)' }}>{error}</p>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
              No {type} yet.
            </p>
          )}

          {!loading && !error && users.map(u => {
            const profileHref = u.username ? `/u/${u.username}` : `/u/${u.id}`
            const isOwn = viewerId === u.id

            return (
              <div key={u.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-background-subtle transition-colors">
                <Link href={profileHref} onClick={onClose} className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold shrink-0 select-none"
                    style={{ background: 'var(--color-primary)', color: '#04140e' }}>
                    {u.avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : (u.name[0] || 'U').toUpperCase()
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate hover:underline" style={{ color: 'var(--color-foreground)' }}>
                      {u.name}
                    </p>
                    {u.username && (
                      <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
                        @{u.username}
                      </p>
                    )}
                  </div>
                </Link>

                {!isOwn && (
                  <FollowButton
                    userId={u.id}
                    initialFollowing={u.isFollowing ?? false}
                    isAuthenticated={isAuthenticated}
                    viewerId={viewerId}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
