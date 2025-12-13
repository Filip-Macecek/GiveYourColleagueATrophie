import { useEffect } from 'react'
import './TrophyPresentation.css'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import { useConfetti } from '../hooks/useConfetti'

interface Trophy {
  id: string
  recipientName: string
  achievementText: string
  submitterName?: string
  displayOrder: number
}

interface TrophyPresentationProps {
  trophy: Trophy
}

/**
 * TrophyPresentation - Component for displaying trophy details with confetti animation.
 * Features:
 * - Triggers confetti when trophy enters viewport (50% visible)
 * - Respects 30-second throttle per trophy
 * - Honors prefers-reduced-motion accessibility preference
 * - Displays 2D spinning trophy with 8-second rotation
 * - Overlays receiver name and achievement text
 * - Shows giver name with "From:" label
 * - Applies defaults: receiverName="Recipient", achievementTitle="Achievement", giverName="Anonymous"
 */
export function TrophyPresentation({ trophy }: TrophyPresentationProps) {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 })
  const { fireConfetti } = useConfetti()

  // Apply default values
  const receiverName = trophy.recipientName?.trim() || 'Recipient'
  const achievementTitle = trophy.achievementText?.trim() || 'Achievement'
  const giverName = trophy.submitterName?.trim() || 'Anonymous'

  // Trigger confetti when trophy enters viewport
  useEffect(() => {
    if (isIntersecting) {
      fireConfetti(trophy.id)
    }
  }, [isIntersecting, trophy.id, fireConfetti])

  return (
    <div 
      className="trophy-presentation" 
      ref={ref as any}
      role="figure"
      aria-label={`Trophy for ${receiverName}: ${achievementTitle}. From: ${giverName}`}
    >
      <div className="trophy-visual">
        <div className="trophy-3d-placeholder">
          <div className="trophy-icon" aria-hidden="true">🏆</div>
        </div>
      </div>

      <div className="trophy-overlay">
        <h2 className="recipient-name">{receiverName}</h2>
        <p className="achievement-text">{achievementTitle}</p>
        <p className="giver-info">From: {giverName}</p>
      </div>
    </div>
  )
}
