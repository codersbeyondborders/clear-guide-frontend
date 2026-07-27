'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import {
  User, Lock, Bell, Trash2, Check, AlertTriangle, Eye, EyeOff, Loader2,
  Building2, Users, Plus, X, ChevronDown, Shield, Mail,
} from 'lucide-react'
import { auth } from '@/lib/firebase'
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, type User as FirebaseUser } from 'firebase/auth'
import { ROLE_PERMISSIONS } from '@/lib/types'
import type { CompanyRole, TeamMember } from '@/lib/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl border p-6 space-y-5"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="space-y-0.5">
        <h2 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
          {title}
        </h2>
        {description && (
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {description}
          </p>
        )}
      </div>
      <div
        className="border-t"
        style={{ borderColor: 'var(--color-border)' }}
        aria-hidden="true"
      />
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Inline alert
// ---------------------------------------------------------------------------
function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm"
      style={{
        backgroundColor:
          type === 'success'
            ? 'var(--color-primary-subtle)'
            : 'color-mix(in srgb, var(--color-destructive) 8%, transparent)',
        color: type === 'success' ? 'var(--color-primary)' : 'var(--color-destructive)',
        borderColor:
          type === 'success'
            ? 'color-mix(in srgb, var(--color-primary) 25%, transparent)'
            : 'color-mix(in srgb, var(--color-destructive) 25%, transparent)',
      }}
    >
      {type === 'success' ? (
        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile section
// ---------------------------------------------------------------------------
function ProfileSection({ email }: { email: string }) {
  const [displayName, setDisplayName] = useState(
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  )
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSave = async () => {
    if (!displayName.trim()) return
    setSaving(true)
    setFeedback(null)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('Not signed in')
      await updateProfile(currentUser, { displayName })
      setFeedback({ type: 'success', message: 'Profile updated successfully.' })
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message ?? 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection title="Profile" description="Update your display name and account info.">
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          aria-hidden="true"
        >
          {getInitials(displayName || email)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm" style={{ color: 'var(--color-foreground)' }}>
            {displayName || email}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {email}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="display-name" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Display Name
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="auth-input"
            aria-describedby="display-name-hint"
          />
          <p id="display-name-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Shown in your dashboard and sidebar.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email-readonly" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Email Address
          </label>
          <input
            id="email-readonly"
            type="email"
            value={email}
            readOnly
            disabled
            className="auth-input"
            aria-describedby="email-readonly-hint"
          />
          <p id="email-readonly-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            Contact support to change your email.
          </p>
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving || !displayName.trim()} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Company section
// ---------------------------------------------------------------------------
const INDUSTRY_OPTIONS = [
  'Consumer Electronics', 'Home Appliances', 'Industrial Equipment', 'Medical Devices',
  'Automotive', 'Power Tools', 'HVAC & Plumbing', 'Software & Technology', 'Furniture',
  'Sporting Goods', 'Other',
]

function CompanySection() {
  const [companyName, setCompanyName] = useState('Acme Manufacturing Co.')
  const [industry, setIndustry] = useState('Consumer Electronics')
  const [website, setWebsite] = useState('https://acme.example.com')
  const [description, setDescription] = useState('We manufacture high-quality consumer electronics and smart home devices.')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const MAX_DESC = 300

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    // Company profile is stored in the backend — simulate for now
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setFeedback({ type: 'success', message: 'Company profile updated.' })
  }

  return (
    <SettingsSection
      title="Company Profile"
      description="This information appears on your manufacturer page and product manuals."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="company-name" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Company Name <span style={{ color: 'var(--color-destructive)' }} aria-hidden="true">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="auth-input"
            aria-required="true"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="industry" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Industry
          </label>
          <div className="relative">
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="auth-input appearance-none pr-8 w-full"
            >
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--color-muted-foreground)' }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label htmlFor="company-website" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Company Website
          </label>
          <input
            id="company-website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.com"
            className="auth-input"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label htmlFor="company-description" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              Company Description
            </label>
            <span
              className="text-xs"
              aria-live="polite"
              style={{ color: description.length > MAX_DESC * 0.9 ? 'var(--color-destructive)' : 'var(--color-muted-foreground)' }}
            >
              {description.length}/{MAX_DESC}
            </span>
          </div>
          <textarea
            id="company-description"
            value={description}
            onChange={(e) => { if (e.target.value.length <= MAX_DESC) setDescription(e.target.value) }}
            rows={3}
            placeholder="Describe your company and what you manufacture…"
            className="auth-input resize-none"
            style={{ minHeight: '80px' }}
          />
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving || !companyName.trim()} className="btn-primary flex items-center gap-2">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
          {saving ? 'Saving…' : 'Save Company Profile'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Team section
// ---------------------------------------------------------------------------
const INITIAL_TEAM: TeamMember[] = [
  { id: 't1', name: 'Sarah Chen', email: 'sarah.chen@acme.com', role: 'admin', status: 'active', joinedAt: '2024-01-15', image: null },
  { id: 't2', name: 'Marcus Webb', email: 'm.webb@acme.com', role: 'manager', status: 'active', joinedAt: '2024-03-08', image: null },
  { id: 't3', name: 'Priya Sharma', email: 'priya@acme.com', role: 'creator', status: 'active', joinedAt: '2024-06-20', image: null },
  { id: 't4', name: 'James Osei', email: 'j.osei@acme.com', role: 'viewer', status: 'active', joinedAt: '2024-09-11', image: null },
  { id: 't5', name: 'Invited User', email: 'newmember@partner.com', role: 'creator', status: 'pending', joinedAt: '2025-07-20', image: null },
]

const ROLE_BADGE_STYLES: Record<CompanyRole, { bg: string; color: string }> = {
  owner:   { bg: 'color-mix(in srgb, #a855f7 12%, transparent)', color: '#a855f7' },
  admin:   { bg: 'color-mix(in srgb, var(--color-primary) 12%, transparent)', color: 'var(--color-primary)' },
  manager: { bg: 'color-mix(in srgb, #3b82f6 12%, transparent)', color: '#3b82f6' },
  creator: { bg: 'color-mix(in srgb, #10b981 12%, transparent)', color: '#10b981' },
  viewer:  { bg: 'var(--color-background-subtle)', color: 'var(--color-muted-foreground)' },
}

function TeamSection() {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<CompanyRole>('creator')
  const [inviteError, setInviteError] = useState('')
  const [inviteSending, setInviteSending] = useState(false)

  const handleRoleChange = (id: string, role: CompanyRole) => {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)))
  }

  const handleRemove = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id))
  }

  const handleInvite = async () => {
    setInviteError('')
    if (!inviteEmail.trim()) { setInviteError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) { setInviteError('Enter a valid email address.'); return }
    if (team.some((m) => m.email === inviteEmail)) { setInviteError('This email is already on the team.'); return }
    setInviteSending(true)
    await new Promise((r) => setTimeout(r, 700))
    const newMember: TeamMember = {
      id: `t${Date.now()}`,
      name: inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
      image: null,
    }
    setTeam((prev) => [...prev, newMember])
    setInviteSending(false)
    setInviteEmail('')
    setShowInviteModal(false)
  }

  return (
    <>
      <SettingsSection
        title="Team Management"
        description="Invite team members from your company and assign roles to control their access."
      >
        {/* Role permissions legend */}
        <div
          className="rounded-xl border p-4 space-y-3"
          style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted-foreground)' }}>
              Role Permissions
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(Object.entries(ROLE_PERMISSIONS) as [CompanyRole, typeof ROLE_PERMISSIONS[CompanyRole]][]).map(([role, info]) => (
              <div key={role} className="flex items-start gap-3">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 mt-0.5"
                  style={{ backgroundColor: ROLE_BADGE_STYLES[role].bg, color: ROLE_BADGE_STYLES[role].color }}
                >
                  {info.label}
                </span>
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    {info.description}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-foreground)' }}>
                    {info.permissions.join(' · ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team table header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
            {team.length} {team.length === 1 ? 'member' : 'members'}
          </p>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Invite Member
          </button>
        </div>

        {/* Team list */}
        <div className="space-y-2" role="list" aria-label="Team members">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
              role="listitem"
            >
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
                aria-hidden="true"
              >
                {getInitials(member.name)}
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                    {member.name}
                  </p>
                  {member.status === 'pending' && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: 'color-mix(in srgb, #f59e0b 12%, transparent)',
                        color: '#d97706',
                      }}
                    >
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
                  {member.email}
                </p>
              </div>

              {/* Role selector */}
              <div className="relative shrink-0">
                <label htmlFor={`role-${member.id}`} className="sr-only">
                  Role for {member.name}
                </label>
                <select
                  id={`role-${member.id}`}
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as CompanyRole)}
                  className="appearance-none text-xs font-semibold px-2.5 py-1.5 rounded-lg border pr-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    backgroundColor: ROLE_BADGE_STYLES[member.role].bg,
                    color: ROLE_BADGE_STYLES[member.role].color,
                    borderColor: ROLE_BADGE_STYLES[member.role].color + '40',
                  }}
                >
                  {(Object.keys(ROLE_PERMISSIONS) as CompanyRole[]).map((r) => (
                    <option key={r} value={r} style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}>
                      {ROLE_PERMISSIONS[r].label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                  style={{ color: ROLE_BADGE_STYLES[member.role].color }}
                  aria-hidden="true"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(member.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-label={`Remove ${member.name}`}
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* ── Invite modal ───────────────────────────────────────────────────── */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowInviteModal(false)}
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-sm rounded-2xl border p-6 space-y-5 shadow-xl"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                <h3 id="invite-modal-title" className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
                  Invite Team Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteEmail('') }}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ color: 'var(--color-muted-foreground)' }}
                aria-label="Close invite modal"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="invite-email" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                  Email Address <span style={{ color: 'var(--color-destructive)' }} aria-hidden="true">*</span>
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError('') }}
                  placeholder="colleague@company.com"
                  className="auth-input"
                  aria-describedby={inviteError ? 'invite-error' : undefined}
                  aria-invalid={!!inviteError}
                  style={inviteError ? { borderColor: 'var(--color-destructive)' } : {}}
                  autoFocus
                />
                {inviteError && (
                  <p id="invite-error" className="text-xs" style={{ color: 'var(--color-destructive)' }} aria-live="polite">
                    {inviteError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="invite-role" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                  Role
                </label>
                <div className="relative">
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as CompanyRole)}
                    className="auth-input appearance-none pr-8 w-full"
                  >
                    {(Object.keys(ROLE_PERMISSIONS) as CompanyRole[]).map((r) => (
                      <option key={r} value={r}>{ROLE_PERMISSIONS[r].label} — {ROLE_PERMISSIONS[r].description}</option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--color-muted-foreground)' }}
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                  {ROLE_PERMISSIONS[inviteRole].permissions.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowInviteModal(false); setInviteError(''); setInviteEmail('') }}
                className="flex-1 py-2.5 px-4 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInvite}
                disabled={inviteSending || !inviteEmail.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
              >
                {inviteSending && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                {inviteSending ? 'Sending…' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Password section
// ---------------------------------------------------------------------------
function PasswordSection() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const mismatch = confirm.length > 0 && next !== confirm
  const weak = next.length > 0 && next.length < 8
  const canSubmit = current.trim() && next.trim() && confirm.trim() && !mismatch && !weak

  const handleSave = async () => {
    if (!canSubmit) return
    setSaving(true)
    setFeedback(null)
    try {
      const currentUser = auth.currentUser
      if (!currentUser || !currentUser.email) throw new Error('Not signed in')
      // Re-authenticate before changing password (Firebase requirement)
      const credential = EmailAuthProvider.credential(currentUser.email, current)
      await reauthenticateWithCredential(currentUser, credential)
      await updatePassword(currentUser, next)
      setFeedback({ type: 'success', message: 'Password updated successfully.' })
      setCurrent(''); setNext(''); setConfirm('')
    } catch (err: any) {
      const msg = err?.code === 'auth/wrong-password'
        ? 'Current password is incorrect.'
        : err?.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign back in, then try again.'
        : err?.message ?? 'Failed to update password.'
      setFeedback({ type: 'error', message: msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection title="Password" description="Change your account password. Use at least 8 characters.">
      <div className="space-y-4 max-w-sm">
        <div className="space-y-1.5">
          <label htmlFor="current-pw" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Current Password
          </label>
          <div className="relative">
            <input
              id="current-pw"
              type={showCurrent ? 'text' : 'password'}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="auth-input pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-pw" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            New Password
          </label>
          <div className="relative">
            <input
              id="new-pw"
              type={showNext ? 'text' : 'password'}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="auth-input pr-10"
              autoComplete="new-password"
              aria-describedby={weak ? 'pw-weak' : undefined}
              aria-invalid={weak}
              style={weak ? { borderColor: 'var(--color-destructive)' } : {}}
            />
            <button
              type="button"
              onClick={() => setShowNext((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={showNext ? 'Hide new password' : 'Show new password'}
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              {showNext ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {weak && (
            <p id="pw-weak" className="text-xs" style={{ color: 'var(--color-destructive)' }}>
              Must be at least 8 characters.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-pw" className="block text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            Confirm New Password
          </label>
          <input
            id="confirm-pw"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="auth-input"
            autoComplete="new-password"
            aria-describedby={mismatch ? 'pw-mismatch' : undefined}
            aria-invalid={mismatch}
            style={mismatch ? { borderColor: 'var(--color-destructive)' } : {}}
          />
          {mismatch && (
            <p id="pw-mismatch" className="text-xs" style={{ color: 'var(--color-destructive)' }}>
              Passwords do not match.
            </p>
          )}
        </div>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving || !canSubmit} className="btn-primary">
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Notifications section
// ---------------------------------------------------------------------------
type NotifKey = 'manualPublished' | 'manualFailed' | 'weeklyDigest'

const NOTIF_OPTIONS: { key: NotifKey; label: string; description: string }[] = [
  { key: 'manualPublished', label: 'Manual published', description: 'Receive an email when a manual finishes processing and goes live.' },
  { key: 'manualFailed', label: 'Processing failure', description: 'Alert when a manual fails AI processing and needs your attention.' },
  { key: 'weeklyDigest', label: 'Weekly digest', description: 'A weekly summary of views and engagement across all your manuals.' },
]

const DEFAULT_NOTIF_PREFS: Record<NotifKey, boolean> = {
  manualPublished: true,
  manualFailed: true,
  weeklyDigest: false,
}

function NotificationsSection({ user }: { user: FirebaseUser | null }) {
  // Firebase User has no user_metadata — persist prefs in localStorage
  const storedPrefs = typeof window !== 'undefined'
    ? (() => { try { return JSON.parse(localStorage.getItem('notif_prefs') ?? 'null') } catch { return null } })()
    : null
  const savedPrefs = (storedPrefs ?? DEFAULT_NOTIF_PREFS) as Record<NotifKey, boolean>
  const [prefs, setPrefs] = useState<Record<NotifKey, boolean>>(savedPrefs)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const toggle = (key: NotifKey) => { setPrefs((p) => ({ ...p, [key]: !p[key] })); setFeedback(null) }

  const handleSave = async () => {
    setSaving(true)
    setFeedback(null)
    try {
      localStorage.setItem('notif_prefs', JSON.stringify(prefs))
      setFeedback({ type: 'success', message: 'Notification preferences saved.' })
    } catch {
      setFeedback({ type: 'error', message: 'Failed to save preferences.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsSection title="Notifications" description="Choose which email notifications you want to receive.">
      <div className="space-y-4">
        {NOTIF_OPTIONS.map(({ key, label, description }) => (
          <div key={key} className="flex items-start gap-4">
            <div className="pt-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={prefs[key]}
                aria-label={label}
                onClick={() => toggle(key)}
                className="relative inline-flex w-10 h-5 rounded-full border-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: prefs[key] ? 'var(--color-primary)' : 'var(--color-border-strong)',
                  borderColor: prefs[key] ? 'var(--color-primary)' : 'var(--color-border-strong)',
                }}
              >
                <span
                  className="absolute top-0 left-0 w-4 h-4 rounded-full shadow transition-transform duration-200"
                  style={{ backgroundColor: 'white', transform: prefs[key] ? 'translateX(1.25rem)' : 'translateX(0)' }}
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>{description}</p>
            </div>
          </div>
        ))}
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Danger zone
// ---------------------------------------------------------------------------
function DangerSection({ onLogout }: { onLogout: () => void }) {
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const CONFIRM_PHRASE = 'DELETE'

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/account', { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `Server error ${res.status}`)
      }
      await onLogout()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <SettingsSection title="Danger Zone">
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-destructive) 25%, transparent)',
          backgroundColor: 'color-mix(in srgb, var(--color-destructive) 4%, transparent)',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--color-destructive)' }} aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-destructive)' }}>Delete Account</p>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Permanently delete your account and all associated manuals. This action cannot be undone. Type{' '}
              <strong>{CONFIRM_PHRASE}</strong> to confirm.
            </p>
          </div>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <label htmlFor="confirm-delete" className="sr-only">Type DELETE to confirm account deletion</label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => { setConfirmText(e.target.value); setError(null) }}
            placeholder={`Type "${CONFIRM_PHRASE}" to confirm`}
            className="auth-input"
            aria-describedby="confirm-delete-hint"
            disabled={deleting}
          />
          <p id="confirm-delete-hint" className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            This permanently deletes all your data.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <button
          type="button"
          disabled={confirmText !== CONFIRM_PHRASE || deleting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-destructive)', color: 'var(--color-destructive-foreground)' }}
          onClick={handleDelete}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Trash2 className="w-4 h-4" aria-hidden="true" />}
          {deleting ? 'Deleting…' : 'Delete My Account'}
        </button>
      </div>
    </SettingsSection>
  )
}

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------
type Tab = 'profile' | 'company' | 'team' | 'password' | 'notifications' | 'danger'

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile',       label: 'Profile',        icon: User      },
  { id: 'company',       label: 'Company',        icon: Building2 },
  { id: 'team',          label: 'Team',           icon: Users     },
  { id: 'password',      label: 'Password',       icon: Lock      },
  { id: 'notifications', label: 'Notifications',  icon: Bell      },
  { id: 'danger',        label: 'Danger Zone',    icon: Trash2    },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const { user, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  const email = user?.email ?? ''
  const displayName =
    user?.displayName ??
    email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const initials = getInitials(displayName || email)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
        <div className="text-sm animate-pulse" style={{ color: 'var(--color-muted-foreground)' }}>Loading…</div>
      </div>
    )
  }

  return (
    <DashboardShell displayName={displayName} initials={initials} onLogout={logout}>
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Manage your account, company profile, and team access.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <nav
          className="lg:w-52 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0"
          aria-label="Settings sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            const isDanger = id === 'danger'
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={isActive ? 'page' : undefined}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  backgroundColor: isActive
                    ? isDanger ? 'color-mix(in srgb, var(--color-destructive) 8%, transparent)' : 'var(--color-primary-subtle)'
                    : 'transparent',
                  color: isActive
                    ? isDanger ? 'var(--color-destructive)' : 'var(--color-primary)'
                    : isDanger ? 'var(--color-destructive)' : 'var(--color-muted-foreground)',
                }}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'profile'       && <ProfileSection email={email} />}
          {activeTab === 'company'       && <CompanySection />}
          {activeTab === 'team'          && <TeamSection />}
          {activeTab === 'password'      && <PasswordSection />}
          {activeTab === 'notifications' && <NotificationsSection user={user ?? null} />}
          {activeTab === 'danger'        && <DangerSection onLogout={logout} />}
        </div>
      </div>
    </DashboardShell>
  )
}
