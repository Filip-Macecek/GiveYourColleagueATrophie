import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './PresentationPage.css'
import { TrophyPresentation } from '../components/TrophyPresentation'
import { useTrophies } from '../hooks/useTrophies'
import { useSession } from '../hooks/useSession'

/**
 * PresentationPage - Page for presenting 3D trophies.
 */
export function PresentationPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const { getTrophy } = useTrophies()
  const { startPresentation } = useSession()
  const [currentTrophy, setCurrentTrophy] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    const initializePresentation = async () => {
      if (!sessionCode) return

      try {
        // Start presentation mode
        await startPresentation(sessionCode)

        // Get the first trophy
        // In a real app, we'd get a list of trophies first
        // For now, we'll load the first one by getting it directly
        const firstTrophy = await getTrophy(sessionCode, '')
        setCurrentTrophy(firstTrophy)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load presentation')
      } finally {
        setLoading(false)
      }
    }

    initializePresentation()
  }, [sessionCode, startPresentation, getTrophy])

  const handleNext = async () => {
    if (!currentTrophy?.nextTrophyId || !sessionCode) return

    try {
      const nextTrophy = await getTrophy(sessionCode, currentTrophy.nextTrophyId)
      setCurrentTrophy(nextTrophy)

      if (nextTrophy.isLastTrophy) {
        // Show finished message after a delay
        setTimeout(() => setIsFinished(true), 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load next trophy')
    }
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
            <h1>That is all.</h1>
            <p className="finished-message">Thank you to everyone who participated!</p>
            <a href="/" className="btn-primary">
              Create Another Session
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
              <TrophyPresentation trophy={currentTrophy} />

              <div className="navigation">
                {!currentTrophy.isLastTrophy && (
                  <button onClick={handleNext} className="btn-next">
                    → Next Trophy
                  </button>
                )}
              </div>

              <div className="trophy-counter">
                Trophy {currentTrophy.displayOrder}
                {!currentTrophy.isLastTrophy && <span> • More to come →</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PresentationPage
