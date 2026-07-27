'use client'

import { useState, useRef, useCallback } from 'react'

type VoiceStatus = 'idle' | 'listening' | 'error'

interface UseVoiceInputOptions {
  lang?: string
  onResult?: (text: string) => void
  onError?: (error: string) => void
}

export function useVoiceInput({ lang = 'en-US', onResult, onError }: UseVoiceInputOptions = {}) {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const recognitionRef = useRef<any>(null)

  const isSupported = typeof window !== 'undefined'
    && !!(((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition))

  const start = useCallback(() => {
    if (!isSupported) { onError?.('Speech recognition not supported in this browser.'); return }
    if (status === 'listening') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setStatus('listening')
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript
      setStatus('idle')
      onResult?.(text)
    }
    recognition.onerror = (e: any) => {
      setStatus('error')
      onError?.(e.error ?? 'Voice input error')
      setTimeout(() => setStatus('idle'), 2000)
    }
    recognition.onend = () => setStatus('idle')
    recognition.start()
  }, [isSupported, lang, onError, onResult, status])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setStatus('idle')
  }, [])

  return { status, isSupported, start, stop, isListening: status === 'listening' }
}
