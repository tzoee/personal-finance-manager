import { useCallback, useEffect, useRef } from 'react'

type Politeness = 'polite' | 'assertive'

/**
 * Hook for announcing messages to screen readers using ARIA live regions
 */
export function useAnnounce() {
  const politeRef = useRef<HTMLDivElement | null>(null)
  const assertiveRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create live regions if they don't exist
    if (!document.getElementById('aria-live-polite')) {
      const polite = document.createElement('div')
      polite.id = 'aria-live-polite'
      polite.setAttribute('aria-live', 'polite')
      polite.setAttribute('aria-atomic', 'true')
      polite.className = 'sr-only'
      document.body.appendChild(polite)
      politeRef.current = polite
    } else {
      politeRef.current = document.getElementById('aria-live-polite') as HTMLDivElement
    }

    if (!document.getElementById('aria-live-assertive')) {
      const assertive = document.createElement('div')
      assertive.id = 'aria-live-assertive'
      assertive.setAttribute('aria-live', 'assertive')
      assertive.setAttribute('aria-atomic', 'true')
      assertive.className = 'sr-only'
      document.body.appendChild(assertive)
      assertiveRef.current = assertive
    } else {
      assertiveRef.current = document.getElementById('aria-live-assertive') as HTMLDivElement
    }

    return () => {
      // Cleanup on unmount (optional - usually we want to keep these)
    }
  }, [])

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    const region = politeness === 'assertive' ? assertiveRef.current : politeRef.current
    
    if (region) {
      // Clear first to ensure the message is announced even if it's the same
      region.textContent = ''
      
      // Use setTimeout to ensure the clear happens before the new message
      setTimeout(() => {
        region.textContent = message
      }, 50)
    }
  }, [])

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive')
  }, [announce])

  return {
    announce,
    announcePolite,
    announceAssertive,
  }
}
