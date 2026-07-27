'use client'

import { useRouter } from 'next/navigation'
import { FileText, LayoutGrid, Video, MessageSquare, ArrowRight } from 'lucide-react'

interface ModeSelectorProps {
  manualId: string
  highContrast?: boolean
}

const MODES = [
  {
    id: 'text',
    label: 'Text with Images',
    description: 'Readable step-by-step guide with images and diagrams.',
    icon: FileText,
    href: (id: string) => `/manual/${id}/text`,
    color: 'emerald',
  },
  {
    id: 'infographic',
    label: 'Infographic',
    description: 'Visual summary with icons and illustrated steps.',
    icon: LayoutGrid,
    href: (id: string) => `/manual/${id}/infographic`,
    color: 'blue',
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Watch narrated walkthroughs for each section.',
    icon: Video,
    href: (id: string) => `/manual/${id}/video`,
    color: 'purple',
  },
  {
    id: 'chat',
    label: 'AI Chat',
    description: 'Ask questions and get instant AI-powered answers.',
    icon: MessageSquare,
    href: (id: string) => `/manual/${id}/chat`,
    color: 'orange',
  },
] as const

const COLOR_CLASSES = {
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    hover: 'hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30',
    arrow: 'text-emerald-500',
  },
  blue: {
    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    hover: 'hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-700 dark:hover:bg-blue-950/30',
    arrow: 'text-blue-500',
  },
  purple: {
    icon: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    hover: 'hover:border-violet-300 hover:bg-violet-50/50 dark:hover:border-violet-700 dark:hover:bg-violet-950/30',
    arrow: 'text-violet-500',
  },
  orange: {
    icon: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    hover: 'hover:border-orange-300 hover:bg-orange-50/50 dark:hover:border-orange-700 dark:hover:bg-orange-950/30',
    arrow: 'text-orange-500',
  },
}

export function ModeSelector({ manualId, highContrast = false }: ModeSelectorProps) {
  const router = useRouter()
  const hc = highContrast

  if (hc) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="Select viewing mode">
        {MODES.map(mode => {
          const Icon = mode.icon
          return (
            <button
              key={mode.id}
              role="listitem"
              onClick={() => router.push(mode.href(manualId))}
              className="flex items-start gap-4 p-5 rounded-xl border border-yellow-400 bg-gray-900 hover:bg-gray-800 text-left transition-colors focus-visible:outline-2 focus-visible:outline-yellow-400 focus-visible:outline-offset-2"
              aria-label={`Open ${mode.label} mode`}
            >
              <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-black" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-yellow-400 text-sm">{mode.label}</p>
                <p className="text-yellow-600 text-xs mt-0.5 leading-relaxed">{mode.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list" aria-label="Select viewing mode">
      {MODES.map(mode => {
        const Icon = mode.icon
        const colors = COLOR_CLASSES[mode.color]
        return (
          <button
            key={mode.id}
            role="listitem"
            onClick={() => router.push(mode.href(manualId))}
            className={`flex items-start gap-4 p-5 rounded-xl border border-border bg-card text-left transition-all duration-150 ${colors.hover} focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 group`}
            aria-label={`Open ${mode.label} mode`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{mode.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed text-pretty">{mode.description}</p>
            </div>
            <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${colors.arrow}`} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
