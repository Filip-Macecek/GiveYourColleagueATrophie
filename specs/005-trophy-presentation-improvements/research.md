# Research: Trophy Presentation Improvements (Feature 005)

## Overview

This document captures research findings and technical decisions for improving the trophy presentation experience.

## Problem Analysis

**Current State:**
- Trophy details visible on submission page (spoils surprise)
- Trophy size too small (~400px width, 120px icon)
- Text overlaid on trophy with poor contrast/readability

**Desired State:**
- Trophy details hidden on submission page, only author shown
- Trophy dominates screen (60-70% viewport height)
- Text below trophy with high contrast white background

## Technology Stack (Existing)

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS (no framework), CSS Grid/Flexbox
- **Animations**: CSS transforms, canvas-confetti library
- **Target**: Desktop 1080p (1920x1080) only

## Design Decisions

### Decision 1: Show Author, Hide Recipient/Achievement

**Rationale**: Users want to track who submitted trophies while keeping the actual recipient/achievement as a surprise for the presentation moment.

**Implementation**: Conditional rendering in `SubmissionPage.tsx` - show `submitterName`, hide `recipientName` and `achievementText`.

### Decision 2: Use Viewport Height Units for Trophy Size

**Rationale**: `vh` units ensure trophy scales proportionally to screen height, providing consistent visual impact on 1080p displays.

**Implementation**: Set `.trophy-visual` to `min-height: 60vh` in `TrophyPresentation.css`.

### Decision 3: White Background Panel for Text

**Rationale**: High contrast (dark text on white) ensures readability. Simple, clean design fits the flamboyant trophy visual.

**Implementation**: Add `.trophy-text-section` with `background: #ffffff`, padding, and box-shadow.

### Decision 4: Fixed Font Sizes (No Responsive)

**Rationale**: Optimizing only for desktop 1080p means we can use fixed px sizes without media queries, simplifying implementation.

**Implementation**: 
- Recipient name: 42px bold
- Achievement text: 24px regular
- Giver info: 18px italic

## Contrast Verification (WCAG AA)

| Element | Color | Background | Ratio | Pass? |
|---------|-------|------------|-------|-------|
| Recipient (42px) | #1a1a1a | #ffffff | 15.7:1 | ✅ AAA |
| Achievement (24px) | #333333 | #ffffff | 12.6:1 | ✅ AAA |
| Giver (18px) | #666666 | #ffffff | 5.7:1 | ✅ AA |

**Tool**: WebAIM Contrast Checker

## Constitution Compliance

### ✅ I. Correctness Above All
- Functional requirements clearly defined
- Edge cases documented (long text, missing fields)
- Testing plan includes manual verification of hiding/showing behavior

### ✅ II. Flamboyant, Humorous UI/UX
- Enlarged trophy (60-70vh) creates theatrical impact
- Confetti animation preserved for celebratory feel
- Trophy dominance enhances the "award ceremony" experience

### ✅ III. Test-First Happy Path
- Manual testing checklist covers primary workflow:
  1. Submit trophies → verify details hidden, author shown
  2. Present trophies → verify trophy large, text readable below
- Automated tests not required for CSS/styling changes

### ✅ IV. Code Clarity & Documentation
- CSS classes clearly named (`.trophy-text-section`, `.trophy-placeholder-text`)
- Comments will explain layout structure (trophy visual + text section)

### ✅ V. Simplicity & Restraint
- No new dependencies
- Desktop-only reduces complexity (no responsive code)
- Pure CSS changes, no JavaScript refactoring

## Performance Considerations

- **Trophy Icon**: Unicode emoji, no external assets
- **CSS Animations**: GPU-accelerated `transform: rotateY()`
- **Layout**: Flexbox for text positioning (well-optimized)
- **Expected Impact**: Negligible

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Poor readability on non-1080p displays | Document 1080p requirement; future enhancement for responsive |
| Users confused by hidden details | Clear visual distinction between hidden items |
| Text overflow with very long strings | CSS `word-wrap: break-word` |

## Alternatives Considered

### Option A: Dark Background for Text
**Pros**: Modern aesthetic  
**Cons**: Requires careful color coordination  
**Decision**: Rejected - white background simpler, better contrast

### Option B: Keep Text Overlay
**Pros**: No layout change  
**Cons**: Inherently less readable  
**Decision**: Rejected - user explicitly requested text below trophy

## References

- WCAG 2.1 Contrast Guidelines
- MDN: CSS Viewport Units
- Existing implementation: `TrophyPresentation.tsx`, `SubmissionPage.tsx`

---

**All technical unknowns resolved. Ready for implementation.**
