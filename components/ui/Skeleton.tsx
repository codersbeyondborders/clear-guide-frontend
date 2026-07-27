import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
}

export function Skeleton({ className, lines, ...props }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading content">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 rounded-md bg-background-subtle animate-pulse',
              i === lines - 1 && 'w-3/4',
              className,
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      aria-busy="true"
      aria-label="Loading content"
      className={cn('rounded-md bg-background-subtle animate-pulse', className)}
      {...props}
    />
  )
}
