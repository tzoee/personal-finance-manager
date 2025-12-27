/**
 * FadeIn Component
 * Wrapper that adds fade-in animation to children
 */

import { useEffect, useState, useRef } from 'react'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  once?: boolean
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 300,
  direction = 'up',
  className = '',
  once = true,
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay, once])

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)'
    switch (direction) {
      case 'up': return 'translateY(20px)'
      case 'down': return 'translateY(-20px)'
      case 'left': return 'translateX(20px)'
      case 'right': return 'translateX(-20px)'
      default: return 'translate(0, 0)'
    }
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  )
}

// Staggered fade-in for lists
interface StaggeredFadeInProps {
  children: React.ReactNode[]
  staggerDelay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}

export function StaggeredFadeIn({
  children,
  staggerDelay = 50,
  duration = 300,
  direction = 'up',
  className = '',
}: StaggeredFadeInProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          delay={index * staggerDelay}
          duration={duration}
          direction={direction}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  )
}
