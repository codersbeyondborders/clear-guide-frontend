'use client'

import Link from 'next/link'
import { MapPin, Globe, Wrench, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { HubProfile } from '@/lib/types'
import { FollowButton } from './EngagementButtons'

interface ProfileHeaderProps {
  profile: HubProfile
  viewerId: string | undefined
  isAuthenticated: boolean
  isFollowing?: boolean
}

export function ProfileHeader({ profile, viewerId, isAuthenticated, isFollowing = false }: ProfileHeaderProps) {
  const isOwn = viewerId === profile.id

  return (
    <header className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      {/* Cover band */}
      <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 60%, #059669 100%)' }} aria-hidden />

      <div className="px-5 pb-5">
        {/* Avatar + actions row */}
        <div className="flex items-end justify-between gap-3 -mt-8 mb-3">
          <div className="w-16 h-16 rounded-full border-4 overflow-hidden flex items-center justify-center text-xl font-bold select-none"
            style={{ background: 'var(--color-primary)', color: '#04140e', borderColor: 'var(--color-card)' }}>
            {profile.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={profile.avatarUrl} alt={`${profile.displayName ?? profile.name}'s avatar`} className="w-full h-full object-cover" />
              : (profile.displayName ?? profile.name)[0]?.toUpperCase()
            }
          </div>

          <div className="flex items-center gap-2 pb-1">
            {isOwn
              ? (
                <Link href="/settings/profile"
                  className="btn-outline text-xs px-4 py-1.5 rounded-xl">
                  Edit profile
                </Link>
              )
              : (
                <FollowButton
                  userId={profile.id}
                  initialFollowing={isFollowing}
                  initialCount={profile.followerCount}
                  isAuthenticated={isAuthenticated}
                  viewerId={viewerId}
                />
              )
            }
          </div>
        </div>

        {/* Name + username */}
        <div className="mb-2">
          <h1 className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>
            {profile.displayName ?? profile.name}
          </h1>
          {profile.username && (
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>@{profile.username}</p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm mb-3 leading-relaxed text-pretty" style={{ color: 'var(--color-foreground)' }}>
            {profile.bio}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          {profile.location && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span>{profile.location}</span>
            </span>
          )}
          {profile.websiteUrl && (
            <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              style={{ color: 'var(--color-primary)' }}>
              <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="truncate max-w-[160px]">{profile.websiteUrl.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span>Joined {format(new Date(profile.createdAt), 'MMM yyyy')}</span>
          </span>
        </div>

        {/* Repair specialties */}
        {profile.repairSpecialty && profile.repairSpecialty.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4" aria-label="Repair specialties">
            {profile.repairSpecialty.map(s => (
              <span key={s} className="flex items-center gap-1 badge badge-green text-xs">
                <Wrench className="w-3 h-3" aria-hidden />
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>{profile.postCount}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Posts</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>{profile.followerCount}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Followers</p>
          </div>
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>{profile.followingCount}</p>
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Following</p>
          </div>
        </div>
      </div>
    </header>
  )
}
