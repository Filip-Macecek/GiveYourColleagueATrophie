import { useState } from 'react'
import './SessionPage.css'
import { useSession } from '../hooks/useSession'

/**
 * SessionPage - The main page for creating and managing sessions.
 */
export function SessionPage() {
  const { session, loading, error, createSession } = useSession()
  const [organizerName, setOrganizerName] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSession(organizerName || undefined)
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  const handleCopyUrl = () => {
    if (session?.session?.shareableUrl) {
      const fullUrl = `${window.location.origin}${session.session.shareableUrl}`
      navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="session-page">
      <div className="container">
        <h1>🏆 Trophy3D Sharing</h1>
        <p className="subtitle">Create a session to start sharing trophies with your team</p>

        {!session ? (
          <form onSubmit={handleCreateSession} className="session-form">
            <div className="form-group">
              <label htmlFor="organizerName">Your Name (optional):</label>
              <input
                id="organizerName"
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="e.g., Alice"
                maxLength={100}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary btn-lg">
              {loading ? 'Creating Session...' : 'Start Session'}
            </button>
          </form>
        ) : (
          <div className="session-created">
            <div className="success-icon">✓</div>
            <h2>Session Created!</h2>

            <div className="session-details">
              <div className="detail-item">
                <label>Session Code:</label>
                <code className="session-code">{session.session.sessionCode}</code>
              </div>

              <div className="detail-item">
                <label>Share Link:</label>
                <div className="share-link-container">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${session.session.shareableUrl}`}
                    className="share-link"
                  />
                  <button onClick={handleCopyUrl} className="btn-copy">
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="detail-item">
                <label>Expires In:</label>
                <p>24 hours</p>
              </div>

              {session.trophies && session.trophies.length > 0 && (
                <div className="detail-item">
                  <label>Trophies Submitted:</label>
                  <p>{session.trophies.length}</p>

                  {session.trophies.length >= 1 && (
                    <a href={`/share/${session.session.sessionCode}/present`} className="btn-primary">
                      🎬 Present Trophies
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="next-steps">
              <h3>Next Steps:</h3>
              <ol>
                <li>Share the link above with your team</li>
                <li>Team members submit trophies</li>
                <li>Click "Present Trophies" to showcase them</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionPage
