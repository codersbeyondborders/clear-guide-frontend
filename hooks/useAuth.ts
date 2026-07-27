'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
    router.push('/')
    router.refresh()
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  }
}
