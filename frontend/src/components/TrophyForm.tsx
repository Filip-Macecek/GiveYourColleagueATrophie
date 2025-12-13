import { useState } from 'react'
import './TrophyForm.css'
import { useTrophies } from '../hooks/useTrophies'

interface TrophyFormProps {
  sessionCode: string
  onSuccess?: () => void
}

/**
 * TrophyForm - Component for submitting trophy nominations.
 */
export function TrophyForm({ sessionCode, onSuccess }: TrophyFormProps) {
  const { loading, error, submitTrophy } = useTrophies()
  const [recipientName, setRecipientName] = useState('')
  const [achievementText, setAchievementText] = useState('')
  const [submitterName, setSubmitterName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!recipientName.trim()) {
      errors.recipientName = 'Recipient name is required'
    } else if (recipientName.length > 100) {
      errors.recipientName = 'Recipient name cannot exceed 100 characters'
    }

    if (!achievementText.trim()) {
      errors.achievementText = 'Achievement text is required'
    } else if (achievementText.length > 500) {
      errors.achievementText = 'Achievement text cannot exceed 500 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await submitTrophy(
        sessionCode,
        recipientName.trim(),
        achievementText.trim(),
        submitterName.trim() || undefined
      )

      // Reset form
      setRecipientName('')
      setAchievementText('')
      setSubmitterName('')
      setSubmitted(true)
      setFieldErrors({})

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)

      // Call success callback
      onSuccess?.()
    } catch (err) {
      console.error('Failed to submit trophy:', err)
    }
  }

  return (
    <div className="trophy-form">
      <h2>Submit a Trophy</h2>

      {submitted && (
        <div className="success-message">
          ✓ Trophy submitted successfully!
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipientName">For: <span className="required">*</span></label>
          <input
            id="recipientName"
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Recipient's name (1-100 chars)"
            maxLength={100}
            disabled={loading}
          />
          {fieldErrors.recipientName && (
            <span className="field-error">{fieldErrors.recipientName}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="achievementText">Achievement: <span className="required">*</span></label>
          <textarea
            id="achievementText"
            value={achievementText}
            onChange={(e) => setAchievementText(e.target.value)}
            placeholder="What did they achieve? (1-500 chars)"
            maxLength={500}
            rows={4}
            disabled={loading}
          />
          <div className="char-count">
            {achievementText.length}/500
          </div>
          {fieldErrors.achievementText && (
            <span className="field-error">{fieldErrors.achievementText}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="submitterName">Your Name (optional):</label>
          <input
            id="submitterName"
            type="text"
            value={submitterName}
            onChange={(e) => setSubmitterName(e.target.value)}
            placeholder="Your name (optional)"
            maxLength={100}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-submit">
          {loading ? 'Submitting...' : '🏆 Submit Trophy'}
        </button>
      </form>
    </div>
  )
}
