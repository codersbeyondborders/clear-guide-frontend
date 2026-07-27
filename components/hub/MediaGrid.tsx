'use client'

import { FileText, Video, ExternalLink } from 'lucide-react'
import type { MediaAttachment, LinkMeta } from '@/lib/types'

interface MediaGridProps {
  media: MediaAttachment[]
  linkUrl?: string | null
  linkMeta?: LinkMeta | null
}

export function MediaGrid({ media, linkUrl, linkMeta }: MediaGridProps) {
  const images = media.filter(m => m.type === 'image')
  const videos = media.filter(m => m.type === 'video')
  const docs   = media.filter(m => m.type === 'document')

  return (
    <div className="space-y-2">
      {/* Image grid */}
      {images.length > 0 && (
        <div
          className={`grid gap-1 rounded-xl overflow-hidden ${
            images.length === 1 ? 'grid-cols-1' :
            images.length === 2 ? 'grid-cols-2' :
            images.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
          }`}
          role="list"
          aria-label="Images"
        >
          {images.slice(0, 4).map((img, i) => (
            <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
              className="block relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ paddingTop: images.length === 1 ? '52%' : '100%' }}
              role="listitem"
              aria-label={img.name ?? `Image ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name ?? `Image ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: 'rgba(0,0,0,0.55)' }}>
                  +{images.length - 4}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.map((v, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#000' }}>
          <video
            src={v.url}
            controls
            className="w-full max-h-80"
            aria-label={v.name ?? `Video ${i + 1}`}
            preload="metadata"
          />
        </div>
      ))}

      {/* Documents */}
      {docs.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {docs.map((d, i) => (
            <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-background-subtle)' }}>
              <FileText className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden />
              <span className="flex-1 truncate text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                {d.name ?? 'Document'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden />
            </a>
          ))}
        </div>
      )}

      {/* Link card */}
      {linkUrl && (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-start gap-3 px-3 py-3 rounded-xl border transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background-subtle)' }}>
          {linkMeta?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={linkMeta.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" loading="lazy" />
          )}
          <div className="flex-1 min-w-0">
            {linkMeta?.domain && (
              <p className="text-xs mb-0.5" style={{ color: 'var(--color-primary)' }}>{linkMeta.domain}</p>
            )}
            {linkMeta?.title && (
              <p className="text-sm font-semibold line-clamp-2 text-pretty" style={{ color: 'var(--color-foreground)' }}>{linkMeta.title}</p>
            )}
            {linkMeta?.description && (
              <p className="text-xs mt-0.5 line-clamp-2 text-pretty" style={{ color: 'var(--color-muted-foreground)' }}>{linkMeta.description}</p>
            )}
            {!linkMeta?.title && (
              <p className="text-sm truncate" style={{ color: 'var(--color-foreground)' }}>{linkUrl}</p>
            )}
          </div>
          <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--color-muted-foreground)' }} aria-hidden />
        </a>
      )}
    </div>
  )
}
