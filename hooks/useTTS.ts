'use client'

import { useCallback, useRef } from 'react'
import { useAccessibility } from '@/context/AccessibilityContext'

export function useTTS() {
  const { ttsEnabled } = useAccessibility()
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, lang = 'en') => {
    if (!ttsEnabled || typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = 0.95
    utteranceRef.current = u
    window.speechSynthesis.speak(u)
  }, [ttsEnabled])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
  }, [])

  return { speak, stop, ttsEnabled }
}
