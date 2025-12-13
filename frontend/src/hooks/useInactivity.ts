import { useEffect, useState } from 'react'

/**
 * Hook for tracking user inactivity.
 * 
 * Monitors user activity (mouse movement, key presses, clicks) and returns
 * true when the user has been inactive for the specified timeout duration.
 * Automatically resets the inactivity timer on any detected activity.
 * 
 * @param timeout Duration in milliseconds before user is considered inactive (default: 300000 = 5 minutes)
 * @returns boolean - true if user has been inactive longer than timeout, false otherwise
 * 
 * @example
 * const isInactive = useInactivity(300000) // 5 minutes
 * if (isInactive) {
 *   // Pause polling or show "away" indicator
 * }
 */
export function useInactivity(timeout: number = 300000): boolean {
  const [isInactive, setIsInactive] = useState(false)

  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout>

    /**
     * Reset the inactivity timer and mark user as active.
     * Called whenever user activity is detected.
     */
    const resetTimer = () => {
      clearTimeout(inactivityTimer)
      setIsInactive(false)
      inactivityTimer = setTimeout(() => setIsInactive(true), timeout)
    }

    // Listen for user activity events
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('click', resetTimer)

    // Initialize the inactivity timer
    resetTimer()

    // Cleanup: remove event listeners and clear timer on component unmount
    return () => {
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
      clearTimeout(inactivityTimer)
    }
  }, [timeout])

  return isInactive
}
