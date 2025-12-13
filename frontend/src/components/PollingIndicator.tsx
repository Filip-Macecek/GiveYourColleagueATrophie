import './PollingIndicator.css'

/**
 * Visual indicator showing polling state (active or paused).
 * 
 * Displays "✨ LIVE ✨" badge when polling is active,
 * "😴 SNOOZING 😴" when paused due to inactivity.
 * Features theatrical animations per Trophy3D's flamboyant UI style.
 */
interface PollingIndicatorProps {
  isActive: boolean
}

export function PollingIndicator({ isActive }: PollingIndicatorProps) {
  return (
    <div className={`polling-indicator ${isActive ? 'live' : 'paused'}`}>
      {isActive ? (
        <span className="badge live-badge">
          ✨ LIVE ✨
        </span>
      ) : (
        <span className="badge paused-badge">
          😴 SNOOZING 😴
        </span>
      )}
    </div>
  )
}
