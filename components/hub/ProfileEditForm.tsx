'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, Check, AlertCircle, Plus, X } from 'lucide-react'
import type { HubProfile } from '@/lib/types'

const SPECIALTIES = [
  'Electronics', 'Appliances', 'Smartphones', 'Laptops', 'HVAC',
  'Plumbing', 'Vehicles', 'Power tools', 'Audio equipment', 'Other',
]

interface ProfileEditFormProps {
  profile: HubProfile
  onSaved: (updated: Partial<HubProfile>) => void
}

export function ProfileEditForm({ profile, onSaved }: ProfileEditFormProps) {
  const [displayName, setDisplayName]   = useState(profile.displayName ?? '')
  const [username, setUsername]         = useState(profile.username ?? '')
  const [bio, setBio]                   = useState(profile.bio ?? '')
  const [location, setLocation]         = useState(profile.location ?? '')
  const [websiteUrl, setWebsiteUrl]     = useState(profile.websiteUrl ?? '')
  const [specialties, setSpecialties]   = useState<string[]>(profile.repairSpecialty ?? [])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl)
  const [avatarFile, setAvatarFile]     = useState<File | null>(null)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [errors, setErrors]             = useState<Record<string, string>>({})
  const [serverError, setServerError]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const BIO_MAX = 300
  const overBio = bio.length > BIO_MAX

  function validate() {
    const e: Record<string, string> = {}
    if (displayName.trim().length > 60) e.displayName = 'Max 60 characters'
    if (username && !/^[a-z0-9_]{3,30}$/.test(username.toLowerCase())) e.username = '3–30 chars: letters, numbers, underscores'
    if (overBio) e.bio = `Max ${BIO_MAX} characters`
    if (location.length > 80) e.location = 'Max 80 characters'
    if (websiteUrl && !/^https?:\/\/.+/.test(websiteUrl)) e.websiteUrl = 'Must start with https://'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length) return

    setSaving(true)
    setServerError('')

    // Upload avatar first if changed
    if (avatarFile) {
      const fd = new FormData()
      fd.append('avatar', avatarFile)
      const res = await fetch('/api/hub/profiles/me', { method: 'PATCH', body: fd })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error ?? 'Avatar upload failed'); setSaving(false); return }
    }

    // Patch profile fields
    const res = await fetch('/api/hub/profiles/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        displayName: displayName.trim() || null,
        username: username.trim().toLowerCase() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        websiteUrl: websiteUrl.trim() || null,
        repairSpecialty: specialties,
      }),
    })
    const json = await res.json()
    if (!res.ok) { setServerError(json.error ?? 'Failed to save'); setSaving(false); return }

    onSaved({ displayName: displayName || null, username: username || null, bio: bio || null, location: location || null, websiteUrl: websiteUrl || null, repairSpecialty: specialties, avatarUrl: avatarPreview })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function toggleSpecialty(s: string) {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Edit profile" className="space-y-5">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-xl font-bold select-none"
            style={{ background: 'var(--color-primary)', color: '#04140e' }}>
            {avatarPreview
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarPreview} alt="Your avatar" className="w-full h-full object-cover" />
              : (displayName || profile.name || 'U')[0]?.toUpperCase()
            }
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: 'var(--color-primary)', borderColor: 'var(--color-card)', color: '#04140e' }}>
            <Camera className="w-3 h-3" aria-hidden />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only"
            aria-hidden tabIndex={-1}
            onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>Profile photo</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>JPEG, PNG, WebP — max 5 MB</p>
        </div>
      </div>

      {/* Display name */}
      <div>
        <label htmlFor="displayName" className="block text-xs font-medium mb-1.5"
          style={{ color: 'var(--color-foreground)' }}>Display name</label>
        <input id="displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
          maxLength={61} placeholder="Your name"
          className={`auth-input ${errors.displayName ? 'border-destructive' : ''}`}
          aria-describedby={errors.displayName ? 'displayName-err' : undefined}
          style={errors.displayName ? { borderColor: 'var(--color-destructive)' } : undefined}
        />
        {errors.displayName && (
          <p id="displayName-err" role="alert" className="text-xs mt-1" style={{ color: 'var(--color-destructive)' }}>{errors.displayName}</p>
        )}
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-xs font-medium mb-1.5"
          style={{ color: 'var(--color-foreground)' }}>Username</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none select-none"
            style={{ color: 'var(--color-muted-foreground)' }}>@</span>
          <input id="username" type="text" value={username}
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            maxLength={30} placeholder="username"
            className={`auth-input pl-7 ${errors.username ? 'border-destructive' : ''}`}
            aria-describedby={errors.username ? 'username-err' : undefined}
            style={errors.username ? { borderColor: 'var(--color-destructive)' } : undefined}
          />
        </div>
        {errors.username && (
          <p id="username-err" role="alert" className="text-xs mt-1" style={{ color: 'var(--color-destructive)' }}>{errors.username}</p>
        )}
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-xs font-medium mb-1.5"
          style={{ color: 'var(--color-foreground)' }}>Bio</label>
        <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)}
          rows={3} maxLength={BIO_MAX + 1}
          placeholder="Tell the community about your repair skills…"
          className={`auth-input resize-none ${overBio ? 'border-destructive' : ''}`}
          aria-describedby="bio-counter"
          style={overBio ? { borderColor: 'var(--color-destructive)' } : undefined}
        />
        <p id="bio-counter" aria-live="polite"
          className="text-xs text-right mt-0.5"
          style={{ color: overBio ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}>
          {bio.length}/{BIO_MAX}
        </p>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-xs font-medium mb-1.5"
          style={{ color: 'var(--color-foreground)' }}>Location</label>
        <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)}
          maxLength={80} placeholder="City, Country"
          className="auth-input"
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="websiteUrl" className="block text-xs font-medium mb-1.5"
          style={{ color: 'var(--color-foreground)' }}>Website</label>
        <input id="websiteUrl" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
          placeholder="https://yoursite.com"
          className={`auth-input ${errors.websiteUrl ? 'border-destructive' : ''}`}
          aria-describedby={errors.websiteUrl ? 'website-err' : undefined}
          style={errors.websiteUrl ? { borderColor: 'var(--color-destructive)' } : undefined}
        />
        {errors.websiteUrl && (
          <p id="website-err" role="alert" className="text-xs mt-1" style={{ color: 'var(--color-destructive)' }}>{errors.websiteUrl}</p>
        )}
      </div>

      {/* Repair specialties */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-foreground)' }}>Repair specialties</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select your repair specialties">
          {SPECIALTIES.map(s => {
            const active = specialties.includes(s)
            return (
              <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                aria-pressed={active}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background: active ? 'var(--color-primary-subtle)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                }}>
                {active ? <X className="w-3 h-3" aria-hidden /> : <Plus className="w-3 h-3" aria-hidden />}
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {serverError && (
        <p role="alert" className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-destructive)' }}>
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
          {serverError}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary w-full gap-2">
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden />Saving…</>
          : saved
          ? <><Check className="w-4 h-4" aria-hidden />Saved!</>
          : 'Save changes'
        }
      </button>
    </form>
  )
}
