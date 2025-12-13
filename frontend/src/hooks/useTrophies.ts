import { useState, useCallback, useEffect, useRef } from 'react'
import { apiClient } from '../services/api'

/**
 * Hook for managing trophy state with automatic polling support.
 * 
 * Handles fetching, caching, and polling for trophies in a session.
 * When pollingEnabled is true, automatically fetches trophies every 3 seconds.
 * 
 * @param sessionCode The session code to fetch trophies for (when polling is active)
 * @param pollingEnabled Whether to enable automatic polling (default: true)
 * @returns Object with trophies, loading state, error, lastUpdated timestamp, and refetch function
 * 
 * @example
 * const { trophies, isRefreshing, lastUpdated, error, refetch } = useTrophies(sessionCode, !isInactive)
 * // Use lastUpdated for "Updated X seconds ago" display
 * // Use isRefreshing to show loading state on button
 * // Use refetch() for manual refresh
 * // Polling automatically starts/stops based on pollingEnabled parameter
 */
export function useTrophies(sessionCode?: string, pollingEnabled: boolean = false) {
  const [trophies, setTrophies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Use ref to track if a fetch is in progress, avoiding stale closure issues
  const isFetchingRef = useRef(false)

  /**
   * Fetch trophies from the API.
   * Used by both manual refresh and automatic polling.
   * Prevents concurrent fetches using a ref to avoid dependency issues.
   */
  const fetchTrophies = useCallback(async () => {
    if (!sessionCode) return

    // Prevent concurrent fetch operations using ref instead of state
    if (isFetchingRef.current) return

    isFetchingRef.current = true
    setIsRefreshing(true)
    setError(null)

    try {
      const data = await apiClient.getTrophies(sessionCode)
      setTrophies(data.trophies || data || [])
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Trophy fetch failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to refresh trophies. Retrying...'
      setError(errorMessage)
      // Don't clear existing trophies on error - preserve data
    } finally {
      isFetchingRef.current = false
      setIsRefreshing(false)
    }
  }, [sessionCode])

  /**
   * Polling effect: automatically fetch trophies when pollingEnabled is true.
   * Fetches immediately on mount and then every 3 seconds.
   */
  useEffect(() => {
    if (!pollingEnabled || !sessionCode) return

    // Fetch immediately on mount or when polling starts
    fetchTrophies()

    // Set up interval for polling every 3 seconds
    const pollingInterval = setInterval(() => {
      fetchTrophies()
    }, 3000)

    // Cleanup: clear interval when polling is disabled or component unmounts
    return () => clearInterval(pollingInterval)
  }, [sessionCode, pollingEnabled, fetchTrophies])

  const submitTrophy = useCallback(
    async (
      code: string,
      recipientName: string,
      achievementText: string,
      submitterName?: string
    ) => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiClient.submitTrophy(
          code,
          recipientName,
          achievementText,
          submitterName
        )
        setTrophies((prev) => [...prev, data])
        return data
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const listTrophies = useCallback(async (code: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.listTrophies(code)
      setTrophies(data)
      return data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getTrophy = useCallback(async (code: string, trophyId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getTrophy(code, trophyId)
      return data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // State
    trophies,
    loading,
    error,
    isRefreshing,
    lastUpdated,
    
    // Methods
    submitTrophy,
    listTrophies,
    getTrophy,
    refetch: fetchTrophies
  }
}
