'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Wrench, Bookmark, Rss } from 'lucide-react'
import { ProfileHeader } from '@/components/hub/ProfileHeader'
import { PostCard } from '@/components/hub/PostCard'
import { useEndUser } from '@/hooks/useEndUser'
import type { HubProfile, HubPost } from '@/lib/types'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type ProfileTab = 'posts' | 'bookmarks'

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user, isLoading: authLoading } = useEndUser()

  const [profile, setProfile]         = useState<HubProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError]     = useState('')
  const [isFollowing, setIsFollowing]       = useState(false)
  const [activeTab, setActiveTab]           = useState<ProfileTab>('posts')

  // Fetch profile
  useEffect(() => {
    if (!username) return
    setProfileLoading(true)
    fetch(`/api/hub/profiles/${username}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setProfileError(json.error)
        else {
          setProfile(json.data)
          setIsFollowing(json.data.isFollowing ?? false)
        }
      })
      .catch(() => setProfileError('Failed to load profile'))
      .finally(() => setProfileLoading(false))
  }, [username])

  // Fetch user's posts
  const { data: postsData, isLoading: postsLoading } = useSWR<{ data: HubPost[] }>(
    profile ? `/api/hub/posts?userId=${profile.id}&limit=40` : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  // Fetch bookmarks (only when viewing own profile)
  const isOwnProfile = user && profile && user.uid === profile.id
  const { data: bookmarkData, isLoading: bookmarkLoading } = useSWR<{ data: HubPost[] }>(
    isOwnProfile && activeTab === 'bookmarks' ? '/api/hub/bookmarks' : null,
    fetcher,
    { revalidateOnFocus: false },
  )

  const currentUser = user
    ? {
        id: user.uid,
        name: user.displayName ?? user.email ?? 'You',
        avatarUrl: user.photoURL ?? null,
      }
    : null

  const posts     = postsData?.data ?? []
  const bookmarks = bookmarkData?.data ?? []

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background-subtle)' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b"
        style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/community"
            aria-label="Back to Repair Hub"
            className="p-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ color: 'var(--color-muted-foreground)' }}>
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </Link>
          <Wrench className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
          <Link href="/community"
            className="text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            style={{ color: 'var(--color-foreground)' }}>
            Repair Hub
          </Link>
          <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--color-muted-foreground)' }}>
            / @{username}
          </span>
          {!authLoading && !user && (
            <Link href="/user/sign-in"
              className="ml-auto inline-flex items-center h-8 px-3 rounded-xl border text-xs font-semibold shrink-0"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)' }}>
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-4">
        {/* Loading state */}
        {profileLoading && (
          <div className="flex items-center justify-center py-20 gap-2" role="status" aria-live="polite">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
            <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading profile…</span>
          </div>
        )}

        {/* Error */}
        {!profileLoading && profileError && (
          <div className="rounded-2xl border p-8 text-center"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}>
            <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-destructive)' }} aria-hidden />
            <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>{profileError}</p>
          </div>
        )}

        {/* Profile */}
        {!profileLoading && profile && !profileError && (
          <>
            <ProfileHeader
              profile={profile}
              viewerId={user?.uid}
              isAuthenticated={!!user}
              isFollowing={isFollowing}
            />

            {/* Tabs: posts / bookmarks (bookmarks only for own profile) */}
            <div className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}
                role="tablist" aria-label="Profile tabs">
                <button role="tab" id="tab-posts"
                  aria-selected={activeTab === 'posts'}
                  aria-controls="tabpanel-posts"
                  onClick={() => setActiveTab('posts')}
                  className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{
                    borderColor: activeTab === 'posts' ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === 'posts' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                  }}>
                  <Rss className="w-3.5 h-3.5" aria-hidden /> Posts
                </button>
                {isOwnProfile && (
                  <button role="tab" id="tab-bookmarks"
                    aria-selected={activeTab === 'bookmarks'}
                    aria-controls="tabpanel-bookmarks"
                    onClick={() => setActiveTab('bookmarks')}
                    className="flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{
                      borderColor: activeTab === 'bookmarks' ? 'var(--color-primary)' : 'transparent',
                      color: activeTab === 'bookmarks' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                    }}>
                    <Bookmark className="w-3.5 h-3.5" aria-hidden /> Bookmarks
                  </button>
                )}
              </div>

              {/* Posts tab */}
              <div id="tabpanel-posts" role="tabpanel" aria-labelledby="tab-posts"
                className={`p-4 space-y-3 ${activeTab === 'posts' ? 'block' : 'hidden'}`}>
                {postsLoading && (
                  <div className="flex justify-center py-8" role="status">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
                  </div>
                )}
                {!postsLoading && posts.length === 0 && (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                    No posts yet.
                  </p>
                )}
                {posts.map(p => (
                  <PostCard key={p.id} post={p} viewerId={currentUser?.id} isAuthenticated={!!user} />
                ))}
              </div>

              {/* Bookmarks tab */}
              {isOwnProfile && (
                <div id="tabpanel-bookmarks" role="tabpanel" aria-labelledby="tab-bookmarks"
                  className={`p-4 space-y-3 ${activeTab === 'bookmarks' ? 'block' : 'hidden'}`}>
                  {bookmarkLoading && (
                    <div className="flex justify-center py-8" role="status">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden />
                    </div>
                  )}
                  {!bookmarkLoading && bookmarks.length === 0 && (
                    <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted-foreground)' }}>
                      No bookmarks yet.
                    </p>
                  )}
                  {bookmarks.map(p => (
                    <PostCard key={p.id} post={p} viewerId={currentUser?.id} isAuthenticated={!!user} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
