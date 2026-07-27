'use client'

import { useAccessibility } from '@/context/AccessibilityContext'
import { Play } from 'lucide-react'

interface Section {
  id: string
  sectionNumber: number
  title: string
  videoUrls: string[]
}

interface SectionThumbnailsProps {
  sections: Section[]
  activeIndex: number
  onSelect: (index: number) => void
}

export function SectionThumbnails({ sections, activeIndex, onSelect }: SectionThumbnailsProps) {
  const { highContrast } = useAccessibility()
  const hc = highContrast

  return (
    <nav aria-label="Video section thumbnails">
      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
        Sections
      </p>
      <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
        {sections.map((section, idx) => {
          const isActive = idx === activeIndex
          const hasVideo = section.videoUrls.length > 0
          return (
            <button
              key={section.id}
              onClick={() => onSelect(idx)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all min-w-[200px] lg:min-w-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 flex-shrink-0 ${
                isActive
                  ? hc ? 'bg-yellow-400 text-black border-yellow-400 focus-visible:outline-yellow-400' : 'bg-primary-subtle border-primary/30 focus-visible:outline-primary'
                  : hc ? 'bg-gray-900 border-yellow-400/40 text-yellow-300 hover:bg-gray-800 focus-visible:outline-yellow-400' : 'bg-card border-border hover:bg-background-subtle focus-visible:outline-primary'
              }`}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Section ${section.sectionNumber}: ${section.title}`}
            >
              {/* Thumbnail icon */}
              <div className={`w-12 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                isActive
                  ? hc ? 'bg-black text-yellow-400' : 'bg-primary text-white'
                  : hc ? 'bg-gray-800 text-yellow-600' : 'bg-background-subtle text-muted-foreground'
              }`} aria-hidden="true">
                {hasVideo ? <Play className="w-3 h-3" /> : section.sectionNumber}
              </div>
              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${isActive ? hc ? 'text-black' : 'text-primary' : hc ? 'text-yellow-300' : 'text-foreground'}`}>
                  {section.title}
                </p>
                <p className={`text-xs mt-0.5 ${isActive ? hc ? 'text-black/70' : 'text-muted-foreground' : hc ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                  {hasVideo ? 'Has video' : 'Text only'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
