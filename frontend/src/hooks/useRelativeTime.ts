import { useEffect, useState } from 'react'

/**
 * Hook for formatting timestamps as relative time.
 * 
 * Converts an absolute timestamp to human-readable relative time format
 * (e.g., "just now", "5 seconds ago", "2 minutes ago").
 * Automatically updates every second to keep the relative time accurate.
 * 
 * @param timestamp The timestamp to format, or null if unknown
 * @returns string - Relative time string (e.g., "just now", "5 seconds ago")
 * 
 * @example
 * const relativeTime = useRelativeTime(lastUpdateTime)
 * // Returns: "just now", "3 seconds ago", "2 minutes ago", etc.
 * <p>Updated {relativeTime}</p>
 */
export function useRelativeTime(timestamp: Date | null): string {
  const [relativeTime, setRelativeTime] = useState('')

  useEffect(() => {
    if (!timestamp) {
      setRelativeTime('Never')
      return
    }

    /**
     * Update the relative time string based on elapsed time since timestamp.
     * Handles various time ranges: seconds, minutes, hours.
     */
    const updateRelativeTime = () => {
      const now = new Date()
      const diffMs = now.getTime() - timestamp.getTime()
      const diffSec = Math.floor(diffMs / 1000)

      if (diffSec < 5) {
        setRelativeTime('just now')
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec} seconds ago`)
      } else if (diffSec < 3600) {
        const minutes = Math.floor(diffSec / 60)
        setRelativeTime(`${minutes} minute${minutes > 1 ? 's' : ''} ago`)
      } else {
        const hours = Math.floor(diffSec / 3600)
        setRelativeTime(`${hours} hour${hours > 1 ? 's' : ''} ago`)
      }
    }

    // Update immediately on first render
    updateRelativeTime()

    // Update every second to keep relative time accurate
    const interval = setInterval(updateRelativeTime, 1000)

    // Cleanup: clear interval on unmount or timestamp change
    return () => clearInterval(interval)
  }, [timestamp])

  return relativeTime
}
