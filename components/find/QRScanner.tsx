'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrowserQRCodeReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { QrCode, Camera, Loader2, AlertCircle, ScanLine } from 'lucide-react'

// A published demo manual id used by the desktop "simulate" fallback.
const DEMO_MANUAL_ID = '9daccecf-33e8-4c9c-b8d2-2fb21663f489'

type Status = 'idle' | 'starting' | 'scanning' | 'error'

/**
 * Extracts a ClearGuide manual id from a decoded QR value.
 * Accepts either a full /manual/{id} URL or a bare UUID.
 */
function extractManualId(raw: string): string | null {
  const text = raw.trim()
  const urlMatch = text.match(/\/manual\/([0-9a-fA-F-]{36})/)
  if (urlMatch) return urlMatch[1]
  const uuidMatch = text.match(/^[0-9a-fA-F-]{36}$/)
  if (uuidMatch) return text
  return null
}

export function QRScanner() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [decoded, setDecoded] = useState<string | null>(null)

  // Always stop camera tracks when leaving the component.
  useEffect(() => {
    return () => controlsRef.current?.stop()
  }, [])

  const stop = () => {
    controlsRef.current?.stop()
    controlsRef.current = null
  }

  const handleResult = (value: string) => {
    const id = extractManualId(value)
    stop()
    if (id) {
      setDecoded(value)
      router.push(`/manual/${id}`)
    } else {
      setStatus('error')
      setError('That QR code is not a ClearGuide product code. Try another, or search by specs.')
    }
  }

  const startScan = async () => {
    setError(null)
    setDecoded(null)
    setStatus('starting')

    try {
      const reader = new BrowserQRCodeReader()
      const controls = await reader.decodeFromVideoDevice(
        undefined, // default (rear) camera
        videoRef.current!,
        (result, err, ctrl) => {
          controlsRef.current = ctrl
          if (result) handleResult(result.getText())
        },
      )
      controlsRef.current = controls
      setStatus('scanning')
    } catch (err) {
      console.error('[find] QR scan error:', err)
      setStatus('error')
      const name = err instanceof Error ? err.name : ''
      if (name === 'NotAllowedError') {
        setError('Camera access was denied. Enable camera permissions, or search by specs instead.')
      } else if (name === 'NotFoundError') {
        setError('No camera was found on this device. Use "Simulate scan" or search by specs.')
      } else {
        setError('Could not start the camera. Use "Simulate scan" or search by specs.')
      }
    }
  }

  const simulate = () => {
    stop()
    router.push(`/manual/${DEMO_MANUAL_ID}`)
  }

  const isLive = status === 'scanning' || status === 'starting'

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: 'var(--color-primary-subtle)' }}
          aria-hidden="true"
        >
          <QrCode className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2 className="text-base font-bold text-foreground">Scan product QR code</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Point your camera at the QR code on the product or its packaging.
        </p>
      </div>

      {/* Camera viewport */}
      <div
        className="relative aspect-square w-full max-w-xs mx-auto overflow-hidden rounded-2xl border"
        style={{ backgroundColor: 'var(--color-background-subtle)', borderColor: 'var(--color-border)' }}
      >
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{ display: isLive ? 'block' : 'none' }}
          aria-label="Live camera preview for QR scanning"
          muted
          playsInline
        />

        {/* Framing overlay while scanning */}
        {isLive && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="h-2/3 w-2/3 rounded-xl border-2"
              style={{ borderColor: 'var(--color-primary)' }}
            />
            <ScanLine className="absolute w-8 h-8 animate-pulse" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          </div>
        )}

        {/* Idle / non-live placeholder */}
        {!isLive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <Camera className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-xs text-muted-foreground">Camera preview will appear here</p>
          </div>
        )}

        {status === 'starting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Live status for screen readers */}
      <p className="sr-only" role="status" aria-live="polite">
        {status === 'scanning'
          ? 'Camera active. Scanning for a QR code.'
          : status === 'error'
            ? error ?? 'Scanner error.'
            : decoded
              ? 'QR code detected.'
              : 'Scanner idle.'}
      </p>

      {/* Error alert */}
      {status === 'error' && error && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl border"
          style={{ borderColor: 'var(--color-destructive)', backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)' }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
          <p className="text-sm text-destructive text-pretty">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        {!isLive ? (
          <button onClick={startScan} className="btn-primary w-full gap-2 py-3" aria-label="Start camera to scan QR code">
            <Camera className="w-4 h-4" aria-hidden="true" />
            Start camera
          </button>
        ) : (
          <button
            onClick={() => { stop(); setStatus('idle') }}
            className="w-full gap-2 py-3 rounded-xl border font-semibold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)', backgroundColor: 'var(--color-card)' }}
          >
            Stop camera
          </button>
        )}

        <button
          onClick={simulate}
          className="w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          No camera? Simulate a scan (demo)
        </button>
      </div>
    </div>
  )
}
