import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { LastUpdated } from '../../src/components/LastUpdated'

describe('LastUpdated', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-12-13T10:00:00Z'))
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should display timestamp when provided', () => {
    const now = new Date()
    render(<LastUpdated timestamp={now} />)
    expect(screen.getByText(/Updated just now/)).toBeInTheDocument()
  })

  it('should display "Never" when timestamp is null', () => {
    render(<LastUpdated timestamp={null} />)
    expect(screen.getByText(/Updated Never/)).toBeInTheDocument()
  })

  it('should update every second', async () => {
    const now = new Date()
    const recentTime = new Date(now.getTime() - 4000) // 4 seconds ago
    render(<LastUpdated timestamp={recentTime} />)

    expect(screen.getByText(/just now/)).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText(/6 seconds ago/)).toBeInTheDocument()
  }, 10000)
})
