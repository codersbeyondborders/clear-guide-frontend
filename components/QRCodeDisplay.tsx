'use client'

import { useRouter } from 'next/navigation'
import { ScanLine } from 'lucide-react'

interface QRCodeDisplayProps {
  targetId?: string
}

// Renders a static SVG QR-code stand-in that visually resembles a real QR code.
// In production this would be a real QR code image generated server-side.
export function QRCodeDisplay({ targetId = 'demo-qr-123' }: QRCodeDisplayProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-5">
      {/* QR pattern visual */}
      <div
        className="w-44 h-44 rounded-2xl border-2 border-border p-3 bg-card shadow-sm"
        aria-label="QR code for demo product manual"
        role="img"
      >
        {/* Simplified QR grid pattern using SVG */}
        <svg viewBox="0 0 21 21" className="w-full h-full" aria-hidden="true">
          {/* Top-left finder pattern */}
          <rect x="0" y="0" width="7" height="7" rx="0.5" fill="currentColor" className="text-foreground" />
          <rect x="1" y="1" width="5" height="5" rx="0.3" fill="currentColor" className="text-card" />
          <rect x="2" y="2" width="3" height="3" rx="0.2" fill="currentColor" className="text-foreground" />
          {/* Top-right finder pattern */}
          <rect x="14" y="0" width="7" height="7" rx="0.5" fill="currentColor" className="text-foreground" />
          <rect x="15" y="1" width="5" height="5" rx="0.3" fill="currentColor" className="text-card" />
          <rect x="16" y="2" width="3" height="3" rx="0.2" fill="currentColor" className="text-foreground" />
          {/* Bottom-left finder pattern */}
          <rect x="0" y="14" width="7" height="7" rx="0.5" fill="currentColor" className="text-foreground" />
          <rect x="1" y="15" width="5" height="5" rx="0.3" fill="currentColor" className="text-card" />
          <rect x="2" y="16" width="3" height="3" rx="0.2" fill="currentColor" className="text-foreground" />
          {/* Data modules — random-looking but deterministic */}
          {[
            [9,0],[11,0],[13,0],[8,1],[10,1],[12,1],[9,2],[11,2],
            [8,3],[10,3],[12,3],[0,8],[2,8],[4,8],[6,8],[8,8],[10,8],[12,8],[14,8],[16,8],[18,8],[20,8],
            [9,9],[11,9],[13,9],[15,9],[17,9],[19,9],
            [8,10],[10,10],[12,10],[14,10],[16,10],[18,10],[20,10],
            [9,11],[11,11],[13,11],[8,12],[10,12],[20,12],
            [9,13],[11,13],[13,13],[15,13],[17,13],[19,13],
            [8,14],[10,14],[16,14],[18,14],[20,14],
            [9,15],[11,15],[13,15],[8,16],[10,16],[12,16],[14,16],[18,16],[20,16],
            [9,17],[11,17],[13,17],[15,17],[8,18],[10,18],[16,18],[18,18],[20,18],
            [9,19],[11,19],[8,20],[10,20],[12,20],[14,20],[16,20],[18,20],[20,20],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" className="text-foreground" />
          ))}
        </svg>
      </div>

      <button
        onClick={() => router.push(`/manual/${targetId}`)}
        className="btn-primary gap-2 px-6"
        aria-label="Simulate QR code scan and open manual"
      >
        <ScanLine className="w-4 h-4" aria-hidden="true" />
        Simulate Scan
      </button>

      <p className="text-xs text-muted-foreground text-center max-w-[180px] leading-relaxed">
        In production, scanning this with your phone camera opens the manual instantly.
      </p>
    </div>
  )
}
