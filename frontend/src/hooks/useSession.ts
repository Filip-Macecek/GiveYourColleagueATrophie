import { useState, useCallback } from 'react'
import { apiClient } from '../services/api'

/**
 * Hook for managing session state.
 */
export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = useCallback(async (organizerName?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.createSession(organizerName)
      setSession(data)
      return data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getSession = useCallback(async (sessionCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getSession(sessionCode)
      setSession(data)
      return data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const startPresentation = useCallback(async (sessionCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.startPresentation(sessionCode)
      setSession(data)
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
    session,
    loading,
    error,
    createSession,
    getSession,
    startPresentation
  }
}
