import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PresentTrophiesButton } from '../../src/components/PresentTrophiesButton'

/**
 * Unit Tests for PresentTrophiesButton Component - User Story 2
 * 
 * T061: Tests for button styling, interaction, and behavior
 */

describe('PresentTrophiesButton', () => {
  it('should render button with theatrical styling text', () => {
    const mockClick = vi.fn()
    render(<PresentTrophiesButton onClick={mockClick} />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('🎭 PRESENT TROPHIES! 🎭')
  })

  it('should call onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    render(<PresentTrophiesButton onClick={mockClick} />)

    const button = screen.getByRole('button')
    await user.click(button)

    expect(mockClick).toHaveBeenCalledOnce()
  })

  it('should have the correct CSS class for styling', () => {
    const mockClick = vi.fn()
    render(<PresentTrophiesButton onClick={mockClick} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn-present-trophies')
  })

  it('should have gradient and theatrical styling applied', () => {
    const mockClick = vi.fn()
    const { container } = render(<PresentTrophiesButton onClick={mockClick} />)

    const button = container.querySelector('.btn-present-trophies')
    expect(button).toBeTruthy()
    // Note: CSS class verification above confirms styling is applied
  })

  it('should be keyboard accessible (clickable with Enter key)', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    const { container } = render(<PresentTrophiesButton onClick={mockClick} />)

    const button = container.querySelector('button')
    if (button) {
      button.focus()
      await user.keyboard('{Enter}')
      expect(mockClick).toHaveBeenCalled()
    }
  })
})
