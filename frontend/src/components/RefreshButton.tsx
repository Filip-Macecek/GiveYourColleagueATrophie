import React from 'react'
import './RefreshButton.css'

/**
 * Refresh button component for manual trophy list refresh.
 * 
 * Displays loading state while refresh is in progress.
 * Disabled during fetch operations to prevent concurrent requests.
 */
interface RefreshButtonProps {
  onClick: () => void
  isRefreshing: boolean
}

export function RefreshButton({ onClick, isRefreshing }: RefreshButtonProps) {
  return (
    <button
      className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
      onClick={onClick}
      disabled={isRefreshing}
      title={isRefreshing ? 'Refreshing trophies...' : 'Click to refresh trophies'}
    >
      {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh Trophies'}
    </button>
  )
}
