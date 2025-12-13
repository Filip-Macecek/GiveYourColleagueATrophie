import './TrophyPresentation.css'

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
 * TrophyPresentation - Component for displaying trophy details.
 * Currently shows text-based trophy. In the future, this will integrate three.js for 3D rendering.
 */
export function TrophyPresentation({ trophy }: TrophyPresentationProps) {
  return (
    <div className="trophy-presentation">
      <div className="trophy-visual">
        {/* Placeholder for 3D model - will be implemented with three.js */}
        <div className="trophy-3d-placeholder">
          <div className="trophy-icon">🏆</div>
          <p className="placeholder-text">3D Trophy Model</p>
        </div>
      </div>

      <div className="trophy-overlay">
        <h2 className="recipient-name">{trophy.recipientName}</h2>
        <p className="achievement-text">{trophy.achievementText}</p>
        {trophy.submitterName && (
          <p className="submitter-info">- {trophy.submitterName}</p>
        )}
      </div>
    </div>
  )
}
