'use client'

/**
 * AuthContext.tsx
 *
 * Unified auth context for ClearGuide.
 * Wraps Firebase onAuthStateChanged and resolves which user type is signed in
 * by checking Firestore profile documents.
 *
 * Usage:
 *   const { user, userType, endUserProfile, manufacturerProfile, loading, signOut } = useAuth()
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import {
  getEndUserProfile,
  getManufacturerProfile,
  getAuthUserType,
  signOut as firebaseSignOut,
  type UserType,
} from '@/lib/auth-helpers'
import type { EndUserProfile, ManufacturerProfile } from '@/lib/types'

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** The raw Firebase user (null if signed out) */
  user: FirebaseUser | null
  /** Whether the profile lookup is still in flight */
  loading: boolean
  /** 'end_user' | 'manufacturer' | null */
  userType: UserType
  /** Populated when userType === 'end_user' */
  endUserProfile: EndUserProfile | null
  /** Populated when userType === 'manufacturer' */
  manufacturerProfile: ManufacturerProfile | null
  /** Signs out of Firebase and resets state */
  signOut: () => Promise<void>
  /** Re-fetches the profile (call after profile update) */
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<UserType>(null)
  const [endUserProfile, setEndUserProfile] = useState<EndUserProfile | null>(null)
  const [manufacturerProfile, setManufacturerProfile] = useState<ManufacturerProfile | null>(null)

  const resolveProfile = useCallback(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUserType(null)
      setEndUserProfile(null)
      setManufacturerProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const type = await getAuthUserType(fbUser.uid)
      setUserType(type)

      if (type === 'end_user') {
        const profile = await getEndUserProfile(fbUser.uid)
        setEndUserProfile(profile)
        setManufacturerProfile(null)
      } else if (type === 'manufacturer') {
        const profile = await getManufacturerProfile(fbUser.uid)
        setManufacturerProfile(profile)
        setEndUserProfile(null)
      } else {
        // Signed in via Firebase but no Firestore profile yet
        // (e.g., mid-registration). Leave profiles null.
        setEndUserProfile(null)
        setManufacturerProfile(null)
      }
    } catch (err) {
      console.error('[AuthContext] Failed to resolve profile:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser)
      resolveProfile(fbUser)
    })
    return unsubscribe
  }, [resolveProfile])

  const signOut = useCallback(async () => {
    await firebaseSignOut()
    setUser(null)
    setUserType(null)
    setEndUserProfile(null)
    setManufacturerProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await resolveProfile(user)
  }, [user, resolveProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        userType,
        endUserProfile,
        manufacturerProfile,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
