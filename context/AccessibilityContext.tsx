'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type FontSize = 'sm' | 'md' | 'lg' | 'xl'

interface AccessibilityState {
  highContrast: boolean
  fontSize: FontSize
  ttsEnabled: boolean
  language: string
}

interface AccessibilityContextValue extends AccessibilityState {
  toggleHighContrast: () => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleTTS: () => void
  setLanguage: (lang: string) => void
  fontSizeClass: string
}

const FONT_SIZES: FontSize[] = ['sm', 'md', 'lg', 'xl']
const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}

const defaultState: AccessibilityState = {
  highContrast: false,
  fontSize: 'md',
  ttsEnabled: false,
  language: 'en',
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export function AccessibilityProvider({ children, initialLanguage = 'en' }: { children: React.ReactNode; initialLanguage?: string }) {
  const [state, setState] = useState<AccessibilityState>({ ...defaultState, language: initialLanguage })

  // Persist to sessionStorage so settings survive navigation within a manual session
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('cg-a11y')
      if (stored) setState(prev => ({ ...prev, ...JSON.parse(stored) }))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try { sessionStorage.setItem('cg-a11y', JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const toggleHighContrast = useCallback(() =>
    setState(prev => ({ ...prev, highContrast: !prev.highContrast })), [])

  const increaseFontSize = useCallback(() =>
    setState(prev => {
      const idx = FONT_SIZES.indexOf(prev.fontSize)
      return { ...prev, fontSize: FONT_SIZES[Math.min(idx + 1, FONT_SIZES.length - 1)] }
    }), [])

  const decreaseFontSize = useCallback(() =>
    setState(prev => {
      const idx = FONT_SIZES.indexOf(prev.fontSize)
      return { ...prev, fontSize: FONT_SIZES[Math.max(idx - 1, 0)] }
    }), [])

  const toggleTTS = useCallback(() => {
    setState(prev => ({ ...prev, ttsEnabled: !prev.ttsEnabled }))
    if (typeof window !== 'undefined') window.speechSynthesis.cancel()
  }, [])

  const setLanguage = useCallback((lang: string) =>
    setState(prev => ({ ...prev, language: lang })), [])

  return (
    <AccessibilityContext.Provider value={{
      ...state,
      toggleHighContrast,
      increaseFontSize,
      decreaseFontSize,
      toggleTTS,
      setLanguage,
      fontSizeClass: FONT_SIZE_CLASSES[state.fontSize],
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility must be used inside <AccessibilityProvider>')
  return ctx
}
