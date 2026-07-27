'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Maximize2, Download } from 'lucide-react'
import { useAccessibility } from '@/context/AccessibilityContext'

export interface StoryboardFrame {
  id: string;
  startTime: number; // in seconds
  duration: number; // in seconds
  imageUrl?: string;
  textOverlay?: string;
}

interface StoryboardPlayerProps {
  frames: StoryboardFrame[];
  title: string;
  onDownloadRequest?: () => void;
}

export function StoryboardPlayer({ frames, title, onDownloadRequest }: StoryboardPlayerProps) {
  const { highContrast } = useAccessibility()
  const hc = highContrast

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Calculate total duration from frames
  const duration = frames.length > 0 ? Math.max(...frames.map(f => f.startTime + f.duration)) : 0

  // Animation Loop Variables
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>()
  const timeRef = useRef(0)

  // Pre-load images
  const imageCache = useRef<Record<string, HTMLImageElement>>({})
  
  useEffect(() => {
    frames.forEach(f => {
      if (f.imageUrl && !imageCache.current[f.imageUrl]) {
        const img = new Image()
        img.src = f.imageUrl
        imageCache.current[f.imageUrl] = img
      }
    })
  }, [frames])

  // Render function
  const renderFrame = (currentTime: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Find active frame
    const activeFrame = frames.find(f => currentTime >= f.startTime && currentTime < f.startTime + f.duration)
    
    if (activeFrame) {
      // Draw Image
      if (activeFrame.imageUrl && imageCache.current[activeFrame.imageUrl]?.complete) {
        const img = imageCache.current[activeFrame.imageUrl]
        // Simple letterbox scaling
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const x = (canvas.width / 2) - (img.width / 2) * scale
        const y = (canvas.height / 2) - (img.height / 2) * scale
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
      }

      // Draw Text Overlay
      if (activeFrame.textOverlay) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, canvas.height - 80, canvas.width, 80)
        
        ctx.fillStyle = '#fff'
        ctx.font = '24px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(activeFrame.textOverlay, canvas.width / 2, canvas.height - 40)
      }
    } else {
      // Empty state / transition
      ctx.fillStyle = '#fff'
      ctx.font = '20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('...', canvas.width / 2, canvas.height / 2)
    }

    setProgress((currentTime / duration) * 100)
  }

  // Animation Loop
  const tick = (timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp
    const dt = (timestamp - lastTimeRef.current) / 1000 // seconds
    lastTimeRef.current = timestamp

    if (playing) {
      timeRef.current += dt
      if (timeRef.current > duration) {
        timeRef.current = duration
        setPlaying(false)
      }
      renderFrame(timeRef.current)
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    animationRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationRef.current!)
  }, [playing, duration])

  // Initial render
  useEffect(() => {
    // Initial draw once fonts/images load
    setTimeout(() => renderFrame(timeRef.current), 500)
  }, [frames])


  const toggle = () => {
    if (timeRef.current >= duration) timeRef.current = 0
    lastTimeRef.current = performance.now()
    setPlaying(!playing)
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    timeRef.current = (val / 100) * duration
    renderFrame(timeRef.current)
  }

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border flex flex-col ${hc ? 'border-yellow-400/40 bg-gray-900' : 'border-border bg-black'}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full aspect-video bg-black cursor-pointer"
        onClick={toggle}
      />
      
      {/* Controls */}
      <div className={`p-3 space-y-2 ${hc ? 'bg-gray-900' : 'bg-card'}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs tabular-nums w-8 text-right ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {formatTime((progress / 100) * duration)}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.1}
            value={progress}
            onChange={seek}
            className="flex-1 accent-emerald-500"
          />
          <span className={`text-xs tabular-nums w-8 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${hc ? 'bg-yellow-400 text-black' : 'bg-primary text-white hover:bg-primary-hover'}`}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          
          <span className={`flex-1 text-sm font-medium truncate px-2 ${hc ? 'text-yellow-300' : 'text-foreground'}`}>{title}</span>
          
          {onDownloadRequest && (
            <button
              onClick={onDownloadRequest}
              title="Request MP4 Download (Server-Side Render)"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${hc ? 'border-yellow-400 text-yellow-400' : 'border border-border text-muted-foreground hover:text-foreground'}`}
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
