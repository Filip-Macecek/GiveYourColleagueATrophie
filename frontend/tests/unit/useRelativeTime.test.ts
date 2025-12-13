import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useRelativeTime } from '../../src/hooks/useRelativeTime'

describe('useRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Set a fixed "now" time for consistent testing
    vi.setSystemTime(new Date('2025-12-13T10:00:00Z'))
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should return "Never" when timestamp is null', () => {
    const { result } = renderHook(() => useRelativeTime(null))
    expect(result.current).toBe('Never')
  })

  it('should return "just now" for timestamps within 5 seconds', () => {
    const now = new Date()
    const recentTime = new Date(now.getTime() - 3000) // 3 seconds ago
    const { result } = renderHook(() => useRelativeTime(recentTime))
    expect(result.current).toBe('just now')
  })

  it('should return seconds ago format for timestamps 5-60 seconds old', () => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - 30000) // 30 seconds ago
    const { result } = renderHook(() => useRelativeTime(timestamp))
    expect(result.current).toBe('30 seconds ago')
  })

  it('should return minutes ago format for timestamps 1-60 minutes old', () => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - 300000) // 5 minutes ago
    const { result } = renderHook(() => useRelativeTime(timestamp))
    expect(result.current).toBe('5 minutes ago')
  })

  it('should use singular "minute" for 1 minute ago', () => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - 60000) // 1 minute ago
    const { result } = renderHook(() => useRelativeTime(timestamp))
    expect(result.current).toBe('1 minute ago')
  })

  it('should return hours ago format for timestamps over 60 minutes old', () => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - 7200000) // 2 hours ago
    const { result } = renderHook(() => useRelativeTime(timestamp))
    expect(result.current).toBe('2 hours ago')
  })

  it('should use singular "hour" for 1 hour ago', () => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - 3600000) // 1 hour ago
    const { result } = renderHook(() => useRelativeTime(timestamp))
    expect(result.current).toBe('1 hour ago')
  })

  it('should update every second', async () => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - 4000) // 4 seconds ago
    const { result } = renderHook(() => useRelativeTime(timestamp))

    expect(result.current).toBe('just now')

    // Advance 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(result.current).toBe('6 seconds ago')
  }, 10000)

  it('should transition from seconds to minutes correctly', async () => {
    const now = new Date()
    const timestamp = new Date(now.getTime() - 55000) // 55 seconds ago
    const { result } = renderHook(() => useRelativeTime(timestamp))

    expect(result.current).toBe('55 seconds ago')

    // Advance 6 seconds to cross into 61 seconds (1 minute)
    act(() => {
      vi.advanceTimersByTime(6000)
    })

    expect(result.current).toBe('1 minute ago')
  }, 10000)

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    const now = new Date()
    const timestamp = new Date(now.getTime() - 10000)
    
    const { unmount } = renderHook(() => useRelativeTime(timestamp))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('should clear and restart interval when timestamp changes', async () => {
    const now = new Date()
    const timestamp1 = new Date(now.getTime() - 10000)
    
    const { result, rerender } = renderHook(
      ({ ts }) => useRelativeTime(ts),
      { initialProps: { ts: timestamp1 } }
    )

    expect(result.current).toBe('10 seconds ago')

    // Change timestamp to a different one
    const timestamp2 = new Date(now.getTime() - 30000)
    act(() => {
      rerender({ ts: timestamp2 })
    })

    expect(result.current).toBe('30 seconds ago')
  }, 10000)
})
