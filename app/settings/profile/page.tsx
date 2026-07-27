'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Wrench } from 'lucide-react'
import { ProfileEditForm } from '@/components/hub/ProfileEditForm'
import { useEndUser } from '@/hooks/useEndUser'
import { useRouter } from 'next/navigation'
import type { HubProfile } from '@/lib/types'

export default function SettingsProfilePage() {
  const { user, isLoading: authLoading } = useEndUser()
  const router = useRouter()

  const [profile, setProfile]     = useState<HubProfile | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/user/sign-in?redirect=/settings/profile'); return }

    fetch('/api/hub/profiles/me')
      .then(r => r.json())
      .then(json => {
        if (json.error) setError(json.error)
        else setProfile(json.data)
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [user, authLoading, router])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/community" aria-label="Back to Repair Hub"
            className="p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-muted-foreground)' }}>
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </Link>
          <Wrench className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
          <h1 className="text-sm font-bold" style={{ color: 'var(--color-foreground)' }}>Edit Profile</h1>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-6">
        {/* Auth loading */}
        {(authLoading || (loading && user)) && (
          <div className="flex items-center justify-center py-20 gap-2" role="status" aria-live="polite">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
            <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading…</span>
          </div>
        )}

        {/* Error */}
        {!loading && !authLoading && error && (
          <div className="rounded-2xl border p-8 text-center"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-destructive)' }} aria-hidden />
            <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>{error}</p>
          </div>
        )}

        {/* Form */}
        {!loading && !error && profile && (
          <div className="rounded-2xl border p-5"
            style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="mb-5 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>Profile settings</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
                Your public profile is visible to all Repair Hub members.
              </p>
            </div>
            <ProfileEditForm
              profile={profile}
              onSaved={updated => {
                setProfile(prev => prev ? { ...prev, ...updated } : prev)
                // Navigate to own profile after save
                const newUsername = updated.username ?? profile.username
                if (newUsername) router.push(`/u/${newUsername}`)
              }}
            />
          </div>
        )}
      </main>
    </div>
  )
}
