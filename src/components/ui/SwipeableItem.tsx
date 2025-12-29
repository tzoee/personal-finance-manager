/**
 * SwipeableItem Component
 * List item with swipe-to-reveal actions
 */

import { useRef, useState } from 'react'
import { Trash2, Edit, Check } from 'lucide-react'

interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

interface SwipeableItemProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  onDelete?: () => void
  onEdit?: () => void
  onComplete?: () => void
  threshold?: number
  className?: string
}

export default function SwipeableItem({
  children,
  leftActions,
  rightActions,
  onDelete,
  onEdit,
  onComplete,
  threshold = 80,
  className = '',
}: SwipeableItemProps) {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Default actions if not provided
  const defaultRightActions: SwipeAction[] = []
  if (onEdit) {
    defaultRightActions.push({
      icon: <Edit className="w-5 h-5" />,
      label: 'Edit',
      color: 'bg-blue-500',
      onClick: onEdit,
    })
  }
  if (onDelete) {
    defaultRightActions.push({
      icon: <Trash2 className="w-5 h-5" />,
      label: 'Hapus',
      color: 'bg-red-500',
      onClick: onDelete,
    })
  }

  const defaultLeftActions: SwipeAction[] = []
  if (onComplete) {
    defaultLeftActions.push({
      icon: <Check className="w-5 h-5" />,
      label: 'Selesai',
      color: 'bg-green-500',
      onClick: onComplete,
    })
  }

  const finalLeftActions = leftActions || defaultLeftActions
  const finalRightActions = rightActions || defaultRightActions

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    currentXRef.current = e.touches[0].clientX
    const diff = currentXRef.current - startXRef.current

    // Limit swipe distance
    const maxLeft = finalLeftActions.length * threshold
    const maxRight = finalRightActions.length * threshold
    const clampedDiff = Math.max(-maxRight, Math.min(maxLeft, diff))

    setTranslateX(clampedDiff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = currentXRef.current - startXRef.current

    // Snap to action or reset
    if (diff > threshold && finalLeftActions.length > 0) {
      // Show left actions
      setTranslateX(finalLeftActions.length * threshold)
    } else if (diff < -threshold && finalRightActions.length > 0) {
      // Show right actions
      setTranslateX(-finalRightActions.length * threshold)
    } else {
      // Reset
      setTranslateX(0)
    }
  }

  const handleActionClick = (action: SwipeAction) => {
    setTranslateX(0)
    setTimeout(() => action.onClick(), 200)
  }

  const resetPosition = () => {
    setTranslateX(0)
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Left Actions (revealed when swiping right) */}
      {finalLeftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex">
          {finalLeftActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`flex flex-col items-center justify-center text-white ${action.color}`}
              style={{ width: threshold }}
            >
              {action.icon}
              <span className="text-xs mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {finalRightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex">
          {finalRightActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`flex flex-col items-center justify-center text-white ${action.color}`}
              style={{ width: threshold }}
            >
              {action.icon}
              <span className="text-xs mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        className={`relative bg-white dark:bg-gray-800 transition-transform ${
          isDragging ? '' : 'duration-200'
        }`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={translateX !== 0 ? resetPosition : undefined}
      >
        {children}
      </div>
    </div>
  )
}
