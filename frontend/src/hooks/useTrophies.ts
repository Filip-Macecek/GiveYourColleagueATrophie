import { useState, useCallback } from 'react'
import { apiClient } from '../services/api'

/**
 * Hook for managing trophy state.
 */
export function useTrophies() {
  const [trophies, setTrophies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitTrophy = useCallback(
    async (
      sessionCode: string,
      recipientName: string,
      achievementText: string,
      submitterName?: string
    ) => {
      setLoading(true)
      setError(null)
      try {
        const data = await apiClient.submitTrophy(
          sessionCode,
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

  const listTrophies = useCallback(async (sessionCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.listTrophies(sessionCode)
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

  const getTrophy = useCallback(async (sessionCode: string, trophyId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getTrophy(sessionCode, trophyId)
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
    trophies,
    loading,
    error,
    submitTrophy,
    listTrophies,
    getTrophy
  }
}
