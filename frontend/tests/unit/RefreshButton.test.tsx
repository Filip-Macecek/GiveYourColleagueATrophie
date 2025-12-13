import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RefreshButton } from '../../src/components/RefreshButton'

describe('RefreshButton', () => {
  it('should render button with refresh text when not refreshing', () => {
    const mockClick = vi.fn()
    render(<RefreshButton onClick={mockClick} isRefreshing={false} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('🔄 Refresh Trophies')
  })

  it('should render button with loading text when refreshing', () => {
    const mockClick = vi.fn()
    render(<RefreshButton onClick={mockClick} isRefreshing={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('⏳ Refreshing...')
  })

  it('should be disabled when refreshing', () => {
    const mockClick = vi.fn()
    render(<RefreshButton onClick={mockClick} isRefreshing={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should be enabled when not refreshing', () => {
    const mockClick = vi.fn()
    render(<RefreshButton onClick={mockClick} isRefreshing={false} />)
    
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('should call onClick handler when clicked', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    render(<RefreshButton onClick={mockClick} isRefreshing={false} />)
    
    const button = screen.getByRole('button')
    await user.click(button)
    
    expect(mockClick).toHaveBeenCalledOnce()
  })

  it('should have spinning animation class when refreshing', () => {
    const mockClick = vi.fn()
    render(<RefreshButton onClick={mockClick} isRefreshing={true} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('refreshing')
  })
})
