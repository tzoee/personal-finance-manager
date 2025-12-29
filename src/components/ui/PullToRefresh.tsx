/**
 * PullToRefresh Component
 * Pull down to refresh content
 */

import { useRef, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
  className?: string
  disabled?: boolean
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className = '',
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)

  const canPull = useCallback(() => {
    if (disabled || isRefreshing) return false
    // Only allow pull when scrolled to top
    const container = containerRef.current
    if (!container) return false
    return container.scrollTop <= 0
  }, [disabled, isRefreshing])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canPull()) return
    startYRef.current = e.touches[0].clientY
    currentYRef.current = e.touches[0].clientY
    setIsPulling(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || !canPull()) return
    
    currentYRef.current = e.touches[0].clientY
    const diff = currentYRef.current - startYRef.current

    if (diff > 0) {
      // Apply resistance to pull
      const resistance = 0.5
      const distance = Math.min(diff * resistance, threshold * 1.5)
      setPullDistance(distance)
      
      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling) return
    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      // Trigger refresh
      setIsRefreshing(true)
      setPullDistance(threshold * 0.6) // Keep indicator visible

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      // Reset
      setPullDistance(0)
    }
  }

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none transition-opacity z-10"
        style={{
          top: -40,
          height: 40,
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div
          className={`p-2 rounded-full bg-white dark:bg-gray-700 shadow-lg ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          }}
        >
          <RefreshCw
            className={`w-5 h-5 ${
              progress >= 1 || isRefreshing
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>

      {/* Refreshing overlay text */}
      {isRefreshing && (
        <div className="absolute top-2 left-0 right-0 flex justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow">
            Memuat ulang...
          </span>
        </div>
      )}
    </div>
  )
}
