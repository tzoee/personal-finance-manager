/**
 * BottomSheet Component
 * Mobile-friendly modal that slides up from bottom
 */

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  snapPoints?: number[] // Heights in percentage (e.g., [50, 90])
  initialSnap?: number
  showHandle?: boolean
  showCloseButton?: boolean
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [50, 90],
  initialSnap = 0,
  showHandle = true,
  showCloseButton = true,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)

  const currentHeight = snapPoints[currentSnap]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setCurrentSnap(initialSnap)
      setDragOffset(0)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, initialSnap])

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY
    currentYRef.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    currentYRef.current = e.touches[0].clientY
    const diff = currentYRef.current - startYRef.current
    setDragOffset(Math.max(0, diff)) // Only allow dragging down
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = currentYRef.current - startYRef.current
    const threshold = 100 // pixels

    if (diff > threshold) {
      // Dragged down significantly
      if (currentSnap > 0) {
        // Snap to smaller height
        setCurrentSnap(currentSnap - 1)
      } else {
        // Close the sheet
        onClose()
      }
    } else if (diff < -threshold && currentSnap < snapPoints.length - 1) {
      // Dragged up significantly - snap to larger height
      setCurrentSnap(currentSnap + 1)
    }

    setDragOffset(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    startYRef.current = e.clientY
    currentYRef.current = e.clientY
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    currentYRef.current = e.clientY
    const diff = currentYRef.current - startYRef.current
    setDragOffset(Math.max(0, diff))
  }

  const handleMouseUp = () => {
    handleTouchEnd()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl transition-transform ${
          isDragging ? '' : 'duration-300'
        }`}
        style={{
          height: `${currentHeight}vh`,
          transform: `translateY(${dragOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4" style={{ maxHeight: `calc(${currentHeight}vh - 80px)` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
