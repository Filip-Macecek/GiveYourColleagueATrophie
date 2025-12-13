import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './SubmissionPage.css'
import { TrophyForm } from '../components/TrophyForm'
import { useTrophies } from '../hooks/useTrophies'
import { useSession } from '../hooks/useSession'

/**
 * SubmissionPage - Page for team members to submit trophies.
 */
export function SubmissionPage() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const { trophies, listTrophies } = useTrophies()
  const { session, getSession } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleTrophySubmitted = async () => {
    if (sessionCode) {
      await listTrophies(sessionCode)
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

          {trophies.length > 0 && (
            <div className="trophies-list">
              <h2>Trophies Submitted ({trophies.length})</h2>
              <div className="trophy-items">
                {trophies.map((trophy) => (
                  <div key={trophy.id} className="trophy-item">
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
