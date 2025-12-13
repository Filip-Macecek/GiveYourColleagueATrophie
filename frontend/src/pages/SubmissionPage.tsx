import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './SubmissionPage.css'
import { TrophyForm } from '../components/TrophyForm'
import { useTrophies } from '../hooks/useTrophies'
import { useSession } from '../hooks/useSession'
import { useInactivity } from '../hooks/useInactivity'
import { useRelativeTime } from '../hooks/useRelativeTime'
import { RefreshButton } from '../components/RefreshButton'
import { PollingIndicator } from '../components/PollingIndicator'
import { LastUpdated } from '../components/LastUpdated'

/**
 * SubmissionPage - Page for team members to submit trophies.
 * 
 * Features:
 * - Automatic polling for new trophies every 3 seconds
 * - Manual refresh button
 * - Inactivity detection (pauses polling after 5 minutes)
 * - Visual "LIVE/SNOOZING" indicator
 * - "Updated X seconds ago" timestamp
 * - Highlights new trophies with fade-in animation
 * - "Present Trophies" button (when 2+ trophies exist)
 */
export function SubmissionPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const navigate = useNavigate()
  
  // Hooks for trophy management and polling
  const isInactive = useInactivity(300000) // 5 minutes
  const { trophies, lastUpdated, isRefreshing, error: pollError, refetch, listTrophies } = useTrophies(sessionCode, !isInactive)
  const { session, getSession } = useSession()
  
  // Local state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previousTrophyIds, setPreviousTrophyIds] = useState<Set<string>>(new Set())

  // Initial load
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionCode) return

      try {
        const sessionData = await getSession(sessionCode)
        if (sessionData.session.status === 'Presenting') {
          setError('This session is in presentation mode. No new submissions accepted.')
          return
        }
        await listTrophies(sessionCode)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    loadSessionData()
  }, [sessionCode, getSession, listTrophies])

  // Track new trophies for highlighting animation
  useEffect(() => {
    if (trophies && trophies.length > 0) {
      const currentIds = new Set(trophies.map((t: any) => t.id))
      const newIds = trophies.filter((t: any) => !previousTrophyIds.has(t.id)).map((t: any) => t.id)
      
      if (newIds.length > 0) {
        // Keep highlight for 3 seconds, then update previousTrophyIds
        const timeout = setTimeout(() => {
          setPreviousTrophyIds(currentIds)
        }, 3000)
        return () => clearTimeout(timeout)
      } else {
        setPreviousTrophyIds(currentIds)
      }
    }
  }, [trophies, previousTrophyIds])

  const handleTrophySubmitted = async () => {
    if (sessionCode) {
      await refetch()
    }
  }

  const handlePresentClick = () => {
    if (sessionCode && trophies.length >= 2) {
      navigate(`/share/${sessionCode}/present`)
    }
  }

  if (loading) {
    return (
      <div className="submission-page">
        <div className="container">
          <div className="loading">Loading session...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="submission-page">
        <div className="container">
          <div className="error-container">
            <h2>⚠️ Session Issue</h2>
            <p>{error}</p>
            <a href="/" className="btn-primary">
              ← Create New Session
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="submission-page">
      <div className="container">
        <h1>🎯 Nominate for a Trophy</h1>

        {session && (
          <div className="session-info">
            <p>Session Code: <strong>{session.session?.sessionCode}</strong></p>
          </div>
        )}

        <div className="submission-content">
          <div className="form-section">
            <TrophyForm sessionCode={sessionCode || ''} onSuccess={handleTrophySubmitted} />
          </div>

          {trophies && trophies.length > 0 && (
            <div className="trophies-list">
              <div className="trophies-header">
                <h2>Trophies Submitted ({trophies.length})</h2>
                
                {/* Polling Controls */}
                <div className="polling-controls">
                  <PollingIndicator isActive={!isInactive} />
                  <RefreshButton onClick={refetch} isRefreshing={isRefreshing} />
                </div>

                {/* Last Updated Timestamp */}
                {lastUpdated && <LastUpdated timestamp={lastUpdated} />}

                {/* Error Message from Polling */}
                {pollError && <div className="error-message">⚠️ {pollError}</div>}

                {/* Present Trophies Button (when 2+ trophies) */}
                {trophies.length >= 2 && (
                  <button onClick={handlePresentClick} className="btn-present-trophies">
                    🎭 PRESENT TROPHIES! 🎭
                  </button>
                )}
              </div>

              <div className="trophy-items">
                {trophies.map((trophy: any) => (
                  <div 
                    key={trophy.id}
                    className={`trophy-item ${!previousTrophyIds.has(trophy.id) ? 'new-trophy' : ''}`}
                  >
                    <div className="trophy-number">{trophy.displayOrder}</div>
                    <div className="trophy-content">
                      <h3>{trophy.recipientName}</h3>
                      <p>{trophy.achievementText}</p>
                      {trophy.submitterName && (
                        <p className="submitter">by {trophy.submitterName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubmissionPage
