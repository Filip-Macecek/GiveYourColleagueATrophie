import { useRelativeTime } from '../hooks/useRelativeTime'
import './LastUpdated.css'

/**
 * Component displaying when the trophy list was last updated.
 * 
 * Shows a timestamp in human-readable relative format that updates every second
 * (e.g., "Updated 3 seconds ago", "Updated 2 minutes ago").
 * 
 * @param timestamp The timestamp of the last update (or null if never updated)
 */
interface LastUpdatedProps {
  timestamp: Date | null
}

export function LastUpdated({ timestamp }: LastUpdatedProps) {
  const relativeTime = useRelativeTime(timestamp)

  return (
    <div className="last-updated">
      <small>Updated {relativeTime}</small>
    </div>
  )
}
