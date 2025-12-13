import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useInactivity } from '../../src/hooks/useInactivity'

describe('useInactivity', () => {
  beforeEach(() => {
    // Use fake timers for these tests since we need precise control
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should return false initially (user is active)', () => {
    const { result } = renderHook(() => useInactivity(1000))
    expect(result.current).toBe(false)
  })

  it('should return true after timeout without activity', async () => {
    const { result } = renderHook(() => useInactivity(1000))

    expect(result.current).toBe(false)

    // Fast-forward time past the timeout
    act(() => {
      vi.advanceTimersByTime(1001)
    })

    expect(result.current).toBe(true)
  }, 10000)

  it('should reset inactivity timer on mousemove', async () => {
    const { result } = renderHook(() => useInactivity(1000))

    // Advance partway through timeout
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Simulate mouse movement (reset timer)
    act(() => {
      const mouseEvent = new MouseEvent('mousemove')
      window.dispatchEvent(mouseEvent)
    })

    // Advance past original timeout (but timer was reset)
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(result.current).toBe(false)

    // Now advance past the NEW timeout
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(true)
  }, 10000)

  it('should reset inactivity timer on keydown', async () => {
    const { result } = renderHook(() => useInactivity(1000))

    // Advance partway through timeout
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Simulate key press (reset timer)
    act(() => {
      const keyEvent = new KeyboardEvent('keydown', { key: 'a' })
      window.dispatchEvent(keyEvent)
    })

    // Advance past original timeout (but timer was reset)
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(result.current).toBe(false)
  }, 10000)

  it('should reset inactivity timer on click', async () => {
    const { result } = renderHook(() => useInactivity(1000))

    // Advance partway through timeout
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Simulate click (reset timer)
    act(() => {
      const clickEvent = new MouseEvent('click')
      window.dispatchEvent(clickEvent)
    })

    // Advance past original timeout (but timer was reset)
    act(() => {
      vi.advanceTimersByTime(600)
    })

    expect(result.current).toBe(false)
  }, 10000)

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useInactivity(1000))

    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('should clear timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    const { unmount } = renderHook(() => useInactivity(1000))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('should use custom timeout value', async () => {
    const { result } = renderHook(() => useInactivity(2000))

    // Advance past 1 second - should still be active
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toBe(false)

    // Advance past 2 seconds total - should now be inactive
    act(() => {
      vi.advanceTimersByTime(1001)
    })

    expect(result.current).toBe(true)
  }, 10000)
})
