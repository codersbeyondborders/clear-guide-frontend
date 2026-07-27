'use client'

import { useRouter } from 'next/navigation'
import { FileText, LayoutGrid, Video, MessageSquare } from 'lucide-react'

export type ViewerMode = 'text' | 'infographic' | 'video' | 'chat'

interface ViewerTabBarProps {
  manualId: string
  activeMode: ViewerMode
}

const TABS: { id: ViewerMode; label: string; Icon: typeof FileText }[] = [
  { id: 'text',        label: 'Text',        Icon: FileText      },
  { id: 'infographic', label: 'Visual',      Icon: LayoutGrid    },
  { id: 'video',       label: 'Video',       Icon: Video         },
  { id: 'chat',        label: 'AI Chat',     Icon: MessageSquare },
]

export function ViewerTabBar({ manualId, activeMode }: ViewerTabBarProps) {
  const router = useRouter()

  return (
    <nav
      className="sticky bottom-0 z-20 border-t"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      aria-label="Manual viewing modes"
    >
      <div className="flex items-stretch">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeMode === id
          return (
            <button
              key={id}
              onClick={() => router.push(`/manual/${manualId}/${id}`)}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 py-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              style={{
                color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Switch to ${label} view`}
            >
              {/* Active top border indicator */}
              {isActive && (
                <span
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-b"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  aria-hidden="true"
                />
              )}
              <Icon
                className="w-5 h-5"
                style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                aria-hidden="true"
              />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
