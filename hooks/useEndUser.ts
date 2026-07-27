'use client'

/**
 * hooks/useEndUser.ts
 * -------------------
 * Returns the current Firebase auth user and helpers for role-gating.
 *
 * - isAuthenticated: user has any active session (manufacturer OR end_user)
 * - isGuest:         no active session at all — read-only access applies
 */

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'

interface UseEndUserResult {
  user: User | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
}

export function useEndUser(): UseEndUserResult {
  const [user, setUser]       = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    user,
    isAuthenticated: !!user,
    isGuest: !user && !isLoading,
    isLoading,
  }
}
