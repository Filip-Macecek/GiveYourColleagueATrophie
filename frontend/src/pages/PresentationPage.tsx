import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './PresentationPage.css'
import { TrophyPresentation } from '../components/TrophyPresentation'
import { useTrophies } from '../hooks/useTrophies'
import { useSession } from '../hooks/useSession'

/**
 * PresentationPage - Page for presenting trophies with next navigation.
 * Features:
 * - Loads all trophies for the session
 * - Displays trophies one at a time
 * - Next Trophy button to advance through trophies
 * - Confetti resets for each new trophy
 * - Disabled state when reaching final trophy
 */
export function PresentationPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const { trophies, loading: trophiesLoading, listTrophies } = useTrophies()
  const { startPresentation } = useSession()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  // Initialize presentation and load trophies
  useEffect(() => {
    const initializePresentation = async () => {
      if (!sessionCode) return

      try {
        // Start presentation mode
        await startPresentation(sessionCode)

        // Load all trophies for the session
        await listTrophies(sessionCode)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load presentation')
      } finally {
        setLoading(false)
      }
    }

    initializePresentation()
  }, [sessionCode, startPresentation, listTrophies])

  const currentTrophy = trophies[currentIndex]
  const isLastTrophy = currentIndex === trophies.length - 1
  const hasNextTrophy = currentIndex < trophies.length - 1

  const handleNext = () => {
    if (!hasNextTrophy) {
      // Show finished message
      setIsFinished(true)
      return
    }

    // Advance to next trophy
    setCurrentIndex((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="presentation-page">
        <div className="container">
          <div className="loading">Loading presentation...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="presentation-page">
        <div className="container">
          <div className="error-container">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <a href="/" className="btn-primary">
              ← Back Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isFinished) {
    return (
      <div className="presentation-page">
        <div className="container">
          <div className="finished-screen">
            <div className="finished-animation">🏆</div>
            <h1>That's all!</h1>
            <p className="finished-message">Thank you to everyone who participated!</p>
            <a href="/" className="btn-primary">
              Create Another Session
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (trophies.length === 0) {
    return (
      <div className="presentation-page">
        <div className="container">
          <div className="error-container">
            <h2>No Trophies</h2>
            <p>This session doesn't have any trophies yet.</p>
            <a href="/" className="btn-primary">
              ← Back Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="presentation-page">
      <div className="container">
        <div className="presentation-content">
          {currentTrophy && (
            <>
              <TrophyPresentation trophy={currentTrophy} key={currentTrophy.id} />

              <div className="navigation">
                <button 
                  onClick={handleNext} 
                  className="btn-next"
                  disabled={!hasNextTrophy}
                >
                  {hasNextTrophy ? '→ Next Trophy' : '✓ Finished'}
                </button>
                {trophiesLoading && <span className="loading-indicator">Loading...</span>}
              </div>

              <div className="trophy-counter">
                Trophy {currentIndex + 1} of {trophies.length}
                {hasNextTrophy && <span> • More to come →</span>}
                {isLastTrophy && <span> • Last one!</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PresentationPage
