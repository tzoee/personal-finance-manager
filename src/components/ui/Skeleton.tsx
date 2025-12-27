/**
 * Skeleton Component
 * Loading placeholder with shimmer animation
 */

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  }

  const style: React.CSSProperties = {
    width: width ?? (variant === 'text' ? '100%' : undefined),
    height: height ?? (variant === 'text' ? '1em' : undefined),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Preset skeleton components
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
      <Skeleton variant="text" className="h-4 w-1/3 mb-3" />
      <Skeleton variant="text" className="h-8 w-2/3 mb-2" />
      <Skeleton variant="text" className="h-3 w-1/2" />
    </div>
  )
}

export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 ${className}`}>
      <Skeleton variant="text" className="h-4 w-1/4 mb-4" />
      <div className="flex items-end gap-2 h-32">
        {[40, 60, 45, 80, 55, 70].map((h, i) => (
          <Skeleton key={i} variant="rounded" className="flex-1" height={`${h}%`} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton variant="text" className="h-4 w-2/3 mb-2" />
            <Skeleton variant="text" className="h-3 w-1/3" />
          </div>
          <Skeleton variant="text" className="h-5 w-20" />
        </div>
      ))}
    </div>
  )
}
