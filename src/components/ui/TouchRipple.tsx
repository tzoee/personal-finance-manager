/**
 * TouchRipple Component
 * Material Design-style ripple effect on touch
 */

import { useState, useCallback } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

interface TouchRippleProps {
  children: React.ReactNode
  className?: string
  color?: string
  disabled?: boolean
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void
}

export default function TouchRipple({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.3)',
  disabled = false,
  onClick,
}: TouchRippleProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const createRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return

    const element = e.currentTarget as HTMLElement
    const rect = element.getBoundingClientRect()

    let x: number, y: number
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    const size = Math.max(rect.width, rect.height) * 2

    const newRipple: Ripple = {
      id: Date.now(),
      x: x - size / 2,
      y: y - size / 2,
      size,
    }

    setRipples(prev => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)
  }, [disabled])

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    createRipple(e)
    onClick?.(e)
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      onTouchStart={createRipple}
    >
      {children}
      
      {/* Ripples */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
          }}
        />
      ))}
    </div>
  )
}
