/**
 * useHapticFeedback Hook
 * Provides haptic feedback on supported devices
 */

import { useCallback } from 'react'

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

export function useHapticFeedback() {
  const vibrate = useCallback((type: HapticType = 'light') => {
    // Check if vibration API is supported
    if (!navigator.vibrate) return

    const patterns: Record<HapticType, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      warning: [20, 50, 20],
      error: [30, 50, 30, 50, 30],
    }

    try {
      navigator.vibrate(patterns[type])
    } catch {
      // Silently fail if vibration not supported
    }
  }, [])

  const lightTap = useCallback(() => vibrate('light'), [vibrate])
  const mediumTap = useCallback(() => vibrate('medium'), [vibrate])
  const heavyTap = useCallback(() => vibrate('heavy'), [vibrate])
  const success = useCallback(() => vibrate('success'), [vibrate])
  const warning = useCallback(() => vibrate('warning'), [vibrate])
  const error = useCallback(() => vibrate('error'), [vibrate])

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    success,
    warning,
    error,
  }
}
