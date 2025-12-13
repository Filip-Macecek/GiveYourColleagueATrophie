import { useCallback, useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'

interface UseConfettiOptions {
  particleCount?: number
  duration?: number
  throttleMs?: number
}

interface ConfettiState {
  lastTriggered: number
  prefersReducedMotion: boolean
}

/**
 * Custom hook for managing confetti animations with throttling and accessibility support.
 * 
 * Features:
 * - 30-second throttle per trophy to prevent repeated triggers
 * - Respects prefers-reduced-motion user preference
 * - Configurable particle count and duration
 * - Keyed by trophyId to track trigger state independently
 * 
 * @param options.particleCount - Number of confetti particles. Default: 100
 * @param options.duration - Max animation duration in ms. Default: 2000
 * @param options.throttleMs - Throttle duration in ms. Default: 30000 (30 seconds)
 * @returns Object with fireConfetti function
 * 
 * @example
 * const { fireConfetti } = useConfetti()
 * 
 * useEffect(() => {
 *   if (shouldTrigger) {
 *     fireConfetti(trophyId)
 *   }
 * }, [shouldTrigger])
 */
export function useConfetti(options: UseConfettiOptions = {}) {
  const {
    particleCount = 100,
    duration = 2000,
    throttleMs = 30000,
  } = options

  // Track confetti state per trophy ID
  const stateRef = useRef<Map<string, ConfettiState>>(new Map())
  const prefersReducedMotion = useRef(false)

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mediaQuery.matches

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  /**
   * Fire a confetti burst for a specific trophy.
   * Respects throttle and reduced-motion preferences.
   * 
   * @param trophyId - Unique identifier for the trophy
   * @returns true if confetti was fired, false if throttled or disabled
   */
  const fireConfetti = useCallback(
    (trophyId: string): boolean => {
      // Skip if user prefers reduced motion
      if (prefersReducedMotion.current) {
        return false
      }

      const now = Date.now()
      const state = stateRef.current.get(trophyId)

      // Check throttle: skip if triggered within throttleMs
      if (state && now - state.lastTriggered < throttleMs) {
        return false
      }

      // Update state
      stateRef.current.set(trophyId, {
        lastTriggered: now,
        prefersReducedMotion: prefersReducedMotion.current,
      })

      // Fire confetti with configured parameters
      confetti({
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        startVelocity: 30,
        gravity: 1,
        drift: 0,
        ticks: Math.floor(duration / (1000 / 60)), // Convert duration to ticks (60fps)
      })

      return true
    },
    [particleCount, duration, throttleMs]
  )

  /**
   * Reset the throttle state for a specific trophy.
   * Useful when navigating to a new trophy and wanting to allow confetti again.
   * 
   * @param trophyId - Unique identifier for the trophy
   */
  const resetThrottle = useCallback((trophyId: string) => {
    stateRef.current.delete(trophyId)
  }, [])

  return { fireConfetti, resetThrottle }
}
