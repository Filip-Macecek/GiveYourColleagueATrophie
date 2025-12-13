import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTrophies } from '../../src/hooks/useTrophies'
import { apiClient } from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  apiClient: {
    getTrophies: vi.fn()
  }
}))

describe('useTrophies Polling Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(apiClient.getTrophies).mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should poll every 3 seconds when polling is enabled', async () => {
    // Use real timers for this test to avoid waitFor issues with setInterval
    vi.useRealTimers()
    
    let callCount = 0
    vi.mocked(apiClient.getTrophies).mockImplementation(async () => {
      callCount++
      return [{ id: '1', name: 'Trophy 1' }] as any
    })

    const { result, unmount } = renderHook(() => useTrophies('session1', true))

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.trophies.length).toBe(1)
    })
    const initialCalls = callCount

    // Wait for first poll (should happen at ~3 seconds)
    await waitFor(() => {
      expect(callCount).toBeGreaterThan(initialCalls)
    }, { timeout: 5000 })

    unmount()
    vi.useFakeTimers() // Restore fake timers for other tests
  }, 20000)

  it('should set isRefreshing during fetch and clear after', async () => {
    let resolveApi: () => void = () => {}
    const apiPromise = new Promise<void>(resolve => {
      resolveApi = resolve
    })
    
    vi.mocked(apiClient.getTrophies).mockReturnValue(
      apiPromise.then(() => []) as any
    )

    const { result } = renderHook(() => useTrophies('session1', false))

    // Start manual refetch
    await act(async () => {
      result.current.refetch()
      await vi.runAllTimersAsync()
    })

    // Should be refreshing
    expect(result.current.isRefreshing).toBe(true)

    // Complete fetch
    await act(async () => {
      resolveApi()
      await vi.runAllTimersAsync()
    })
    
    expect(result.current.isRefreshing).toBe(false)
  }, 15000)

  it('should prevent concurrent fetches', async () => {
    let resolveApi: () => void = () => {}
    const apiPromise = new Promise<void>(resolve => {
      resolveApi = resolve
    })
    
    vi.mocked(apiClient.getTrophies).mockReturnValue(
      apiPromise.then(() => []) as any
    )

    const { result } = renderHook(() => useTrophies('session1', false))

    // Start first refetch
    act(() => {
      result.current.refetch()
    })
    expect(result.current.isRefreshing).toBe(true)

    // Try to start second refetch while first is pending
    act(() => {
      result.current.refetch()
    })

    // Should still be only 1 call
    expect(vi.mocked(apiClient.getTrophies).mock.calls.length).toBe(1)

    resolveApi()
  }, 15000)
})
