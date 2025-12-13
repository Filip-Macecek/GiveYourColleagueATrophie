import './PresentTrophiesButton.css'

/**
 * PresentTrophiesButton Component - User Story 2
 * 
 * Displays a theatrical "🎭 PRESENT TROPHIES! 🎭" button with flamboyant styling.
 * 
 * Features:
 * - Gradient background (pink → purple → blue)
 * - Pulsing shadow animation
 * - Hover effects: scale, rotation, glow enhancement
 * - Large, bold text with emojis
 * - Accessible keyboard navigation
 * 
 * @param {Object} props
 * @param {() => void} props.onClick - Handler called when button is clicked
 */
interface PresentTrophiesButtonProps {
  onClick: () => void
}

export function PresentTrophiesButton({ onClick }: PresentTrophiesButtonProps) {
  return (
    <button 
      className="btn-present-trophies"
      onClick={onClick}
      aria-label="Present Trophies in presentation mode"
    >
      🎭 PRESENT TROPHIES! 🎭
    </button>
  )
}
