'use client'

import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react'
import { useAccessibility } from '@/context/AccessibilityContext'

interface VideoPlayerProps {
  src?: string
  title: string
  poster?: string
}

export function VideoPlayer({ src, title, poster }: VideoPlayerProps) {
  const { highContrast } = useAccessibility()
  const hc = highContrast

  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) v.pause(); else v.play()
    setPlaying(!playing)
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    setProgress((v.currentTime / v.duration) * 100)
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = (parseFloat(e.target.value) / 100) * v.duration
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const enterFullscreen = () => videoRef.current?.requestFullscreen?.()

  // No real video in demo: render a placeholder with a "Play" affordance
  if (!src) {
    return (
      <div
        className={`relative w-full aspect-video rounded-2xl border overflow-hidden flex items-center justify-center ${hc ? 'bg-gray-900 border-yellow-400/40' : 'bg-background-subtle border-border'}`}
        role="region"
        aria-label={`Video placeholder for: ${title}`}
      >
        <div className="text-center space-y-3 p-6">
          <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto ${hc ? 'border-yellow-400 text-yellow-400' : 'border-border text-muted-foreground'}`} aria-hidden="true">
            <Play className="w-7 h-7 ml-1" />
          </div>
          <p className={`text-sm font-medium ${hc ? 'text-yellow-300' : 'text-muted-foreground'}`}>{title}</p>
          <p className={`text-xs ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
            No video available for this section in the demo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border ${hc ? 'border-yellow-400/40 bg-gray-900' : 'border-border bg-black'}`}
      role="region"
      aria-label={`Video player: ${title}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        className="w-full aspect-video"
        aria-label={title}
        playsInline
      />

      {/* Controls */}
      <div className={`p-3 space-y-2 ${hc ? 'bg-gray-900' : 'bg-card'}`}>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <span className={`text-xs tabular-nums w-8 text-right ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`} aria-hidden="true">
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
            aria-label="Seek video"
          />
          <span className={`text-xs tabular-nums w-8 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`} aria-hidden="true">
            {formatTime(duration)}
          </span>
        </div>
        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'bg-yellow-400 text-black hover:bg-yellow-300 focus-visible:outline-yellow-400' : 'bg-primary text-white hover:bg-primary-hover focus-visible:outline-primary'}`}
            aria-label={playing ? 'Pause video' : 'Play video'}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => setMuted(m => !m)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border border-border text-muted-foreground hover:text-foreground hover:border-border-strong focus-visible:outline-primary'}`}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            aria-pressed={muted}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <span className={`flex-1 text-sm font-medium truncate ${hc ? 'text-yellow-300' : 'text-foreground'}`}>{title}</span>
          <button
            onClick={enterFullscreen}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${hc ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black focus-visible:outline-yellow-400' : 'border border-border text-muted-foreground hover:text-foreground focus-visible:outline-primary'}`}
            aria-label="Enter fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
