import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PollingIndicator } from '../../src/components/PollingIndicator'

describe('PollingIndicator', () => {
  it('should display LIVE badge when isActive is true', () => {
    render(<PollingIndicator isActive={true} />)
    expect(screen.getByText(/✨ LIVE ✨/)).toBeInTheDocument()
  })

  it('should display SNOOZING badge when isActive is false', () => {
    render(<PollingIndicator isActive={false} />)
    expect(screen.getByText(/😴 SNOOZING 😴/)).toBeInTheDocument()
  })

  it('should have live class when active', () => {
    const { container } = render(<PollingIndicator isActive={true} />)
    expect(container.querySelector('.polling-indicator')).toHaveClass('live')
  })

  it('should have paused class when inactive', () => {
    const { container } = render(<PollingIndicator isActive={false} />)
    expect(container.querySelector('.polling-indicator')).toHaveClass('paused')
  })
})
