# Trophy3D Frontend

React + Vite + TypeScript frontend for the Trophy3D sharing application.

## Features

### Core Features
- Session-based trophy sharing
- Trophy submission with recipient, achievement, and giver names
- Real-time trophy polling with auto-refresh
- Presentation mode with 3D trophy display

### Trophy Rizz Presentation (Feature 003)
Celebratory trophy presentation experience with:

#### 🎉 Confetti Animation
- Automatic confetti burst when trophy enters viewport (50% visibility)
- 30-second throttle per trophy to prevent repeated triggers
- Respects `prefers-reduced-motion` accessibility preference
- Powered by [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) library

#### 🏆 2D Spinning Trophy
- Smooth 8-second rotation animation
- Overlay text with receiver name, achievement, and giver
- Automatic text wrapping for names up to 60 characters
- WCAG AA contrast compliance with strong text shadows
- Animation disabled when user prefers reduced motion

#### ➡️ Next Trophy Navigation
- Navigate through multiple trophies in a session
- Confetti resets for each new trophy
- Loading indicators during transitions
- Disabled state when reaching final trophy
- Trophy counter showing progress

#### ⚙️ Default Values
- Receiver name: "Recipient" (if missing)
- Achievement: "Achievement" (if missing)
- Giver name: "Anonymous" (if missing)

## Tech Stack

- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Language**: TypeScript 5.3
- **Testing**: Vitest + React Testing Library
- **3D Graphics**: three.js (future enhancement)
- **Animations**: canvas-confetti, CSS keyframes
- **Routing**: React Router
- **HTTP Client**: Axios

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Build

```bash
npm run build
# Production build in dist/
```

### Testing

```bash
npm test          # Run unit tests
npm run coverage  # Generate coverage report
```

### Docker

```bash
docker build -t trophy3d-frontend .
docker run -p 3000:80 trophy3d-frontend
```

## Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── TrophyPresentation.tsx      # Trophy display with confetti
│   │   ├── TrophyForm.tsx              # Trophy submission form
│   │   ├── RefreshButton.tsx           # Manual refresh control
│   │   └── PresentTrophiesButton.tsx   # Start presentation
│   ├── hooks/                # Custom React hooks
│   │   ├── useSession.ts               # Session state management
│   │   ├── useTrophies.ts              # Trophy data with polling
│   │   ├── useIntersectionObserver.ts  # Viewport detection
│   │   └── useConfetti.ts              # Confetti trigger logic
│   ├── pages/                # Page components
│   │   ├── SessionPage.tsx             # Main session view
│   │   ├── SubmissionPage.tsx          # Trophy submission
│   │   └── PresentationPage.tsx        # Presentation mode
│   ├── services/             # API and external services
│   │   └── api.ts                      # Backend API client
│   ├── assets/               # Static assets
│   └── main.tsx              # Entry point
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── public/                   # Static files
├── vite.config.ts            # Vite configuration
├── vitest.config.ts          # Test configuration
└── package.json
```

## Custom Hooks

### `useConfetti(options)`
Manages confetti animations with throttling and accessibility.

**Features:**
- 30-second throttle per trophy ID
- Automatic reduced-motion detection
- Configurable particle count and duration

**Example:**
```typescript
const { fireConfetti, resetThrottle } = useConfetti()

// Trigger confetti for a trophy
fireConfetti(trophyId)

// Reset throttle when navigating to new trophy
resetThrottle(trophyId)
```

### `useIntersectionObserver(options)`
Detects when elements enter the viewport.

**Features:**
- Configurable visibility threshold (default: 50%)
- Root margin support
- Enable/disable observation

**Example:**
```typescript
const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 })

useEffect(() => {
  if (isIntersecting) {
    // Element is visible
  }
}, [isIntersecting])

return <div ref={ref}>Content</div>
```

### `useTrophies(sessionCode, pollingEnabled)`
Manages trophy state with automatic polling.

**Features:**
- 3-second polling interval
- Manual refresh via refetch()
- Loading and error states
- Last updated timestamp

**Example:**
```typescript
const { trophies, isRefreshing, lastUpdated, refetch } = useTrophies(sessionCode, true)
```

## Performance

### Confetti Animation
- Target: 30fps minimum
- Max duration: 2 seconds
- Particle count: 80-120
- Optimized with requestAnimationFrame

### Trophy Navigation
- Target: <500ms transition time
- Preloaded trophy data (no fetch on next)
- Smooth CSS animations

## Accessibility

### Reduced Motion
- Confetti disabled when `prefers-reduced-motion: reduce`
- Trophy spin animation disabled
- Graceful degradation for all animations

### Screen Readers
- `role="figure"` on trophy presentations
- Comprehensive `aria-label` with receiver, achievement, and giver
- Semantic HTML structure
- Keyboard navigation support

### Contrast
- WCAG AA compliance
- Strong text shadows for readability
- Gold color for receiver names (#FFD700)
- White text on dark backgrounds

## Dependencies

### Production
- `react` - UI framework
- `react-router-dom` - Routing
- `axios` - HTTP client
- `canvas-confetti` - Confetti animations

### Development
- `vitest` - Test runner
- `@testing-library/react` - React testing utilities
- `typescript` - Type safety
- `vite` - Build tool

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note:** Modern browser with IntersectionObserver and CSS animations support required.

## Configuration

### Environment Variables

Create `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

### API Client

Backend API URL configured in `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
```

## Troubleshooting

### Confetti Not Appearing
- Check browser console for errors
- Verify trophy enters viewport (scroll to 50% visible)
- Check if `prefers-reduced-motion` is enabled
- Verify 30-second throttle hasn't been triggered

### Trophy Not Loading
- Check network tab for API errors
- Verify backend is running
- Check session code is valid
- Review CORS configuration

### Tests Failing
- Clear test cache: `npm run test:clear`
- Rebuild: `npm run build`
- Check Node.js version (18+)

## Contributing

See [specs/003-trophy-rizz/tasks.md](../specs/003-trophy-rizz/tasks.md) for implementation tasks and progress.

## License

TBD
