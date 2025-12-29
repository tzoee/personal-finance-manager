import { useCallback, useEffect, useRef } from 'react'

interface UseKeyboardNavigationOptions {
  onEscape?: () => void
  onEnter?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: (e: KeyboardEvent) => void
  enabled?: boolean
}

/**
 * Hook for handling keyboard navigation in components
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const {
    onEscape,
    onEnter,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onTab,
    enabled = true,
  } = options

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    switch (e.key) {
      case 'Escape':
        onEscape?.()
        break
      case 'Enter':
        onEnter?.()
        break
      case 'ArrowUp':
        e.preventDefault()
        onArrowUp?.()
        break
      case 'ArrowDown':
        e.preventDefault()
        onArrowDown?.()
        break
      case 'ArrowLeft':
        onArrowLeft?.()
        break
      case 'ArrowRight':
        onArrowRight?.()
        break
      case 'Tab':
        onTab?.(e)
        break
    }
  }, [enabled, onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Hook for managing focus within a container (focus trap)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element when trap activates
    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [isActive])

  return containerRef
}

/**
 * Hook for roving tabindex pattern (for lists, menus, etc.)
 */
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both'
    loop?: boolean
  } = {}
) {
  const { orientation = 'vertical', loop = true } = options
  const currentIndexRef = useRef(0)

  const focusItem = useCallback((index: number) => {
    if (index < 0 || index >= items.length) return
    
    items.forEach((item, i) => {
      item.tabIndex = i === index ? 0 : -1
    })
    
    items[index]?.focus()
    currentIndexRef.current = index
  }, [items])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const currentIndex = currentIndexRef.current
    let nextIndex = currentIndex

    const isVertical = orientation === 'vertical' || orientation === 'both'
    const isHorizontal = orientation === 'horizontal' || orientation === 'both'

    if ((e.key === 'ArrowDown' && isVertical) || (e.key === 'ArrowRight' && isHorizontal)) {
      e.preventDefault()
      nextIndex = currentIndex + 1
      if (nextIndex >= items.length) {
        nextIndex = loop ? 0 : items.length - 1
      }
    } else if ((e.key === 'ArrowUp' && isVertical) || (e.key === 'ArrowLeft' && isHorizontal)) {
      e.preventDefault()
      nextIndex = currentIndex - 1
      if (nextIndex < 0) {
        nextIndex = loop ? items.length - 1 : 0
      }
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = items.length - 1
    }

    if (nextIndex !== currentIndex) {
      focusItem(nextIndex)
    }
  }, [items, orientation, loop, focusItem])

  useEffect(() => {
    // Initialize tabindex
    items.forEach((item, i) => {
      item.tabIndex = i === 0 ? 0 : -1
    })
  }, [items])

  return { handleKeyDown, focusItem, currentIndex: currentIndexRef.current }
}
