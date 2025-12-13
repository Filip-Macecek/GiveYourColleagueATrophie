# Feature Specification: Trophy Rizz Presentation

**Feature Branch**: `[003-trophy-rizz]`  
**Created**: December 13, 2025  
**Status**: Draft  
**Input**: User description: "let's use confetti.js to shoot confetti when the trophy comes into view\nLet's make the trophy just 2d and keep the spinning animation\nmake sure the trophy actually has the Name of the receiver and the achievemnt on it\nit should display the name of the person who is giving the trophy\nthe next trophy button should work"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Celebrate trophy reveal with confetti (Priority: P1)

When the trophy presentation comes into view, celebratory confetti bursts to enhance the moment.

**Why this priority**: This is the first visible delight moment; it sets tone and user perception of value.

**Independent Test**: Scroll or navigate to the presentation view; verify a confetti burst triggers once per reveal and does not repeat excessively.

**Acceptance Scenarios**:

1. **Given** the presentation page is loaded but the trophy section is off-screen, **When** the trophy section enters the viewport, **Then** a confetti burst plays once within 1 second.
2. **Given** the confetti has been triggered for this reveal, **When** the user scrolls away and back within 30 seconds, **Then** confetti does not retrigger to avoid visual spam.

---

### User Story 2 - 2D spinning trophy with names (Priority: P1)

Display a 2D trophy with a smooth spin animation and overlay text including receiver name and achievement; show giver name adjacent.

**Why this priority**: Communicates the core content of the trophy clearly; animation adds polish without complexity.

**Independent Test**: Load a trophy with sample data; confirm receiver and achievement appear legibly on/near the trophy, and giver name displays separately; animation runs at a comfortable speed.

**Acceptance Scenarios**:

1. **Given** a trophy with receiver "Alex Kim" and achievement "Top Mentor", **When** the presentation renders, **Then** the trophy appears in 2D with a continuous spin and text shows "Alex Kim — Top Mentor" on/near the trophy.
2. **Given** the trophy has `giverName` "Jordan", **When** displayed, **Then** the UI shows "From: Jordan" in proximity to the trophy component.
3. **Given** long names or achievements (up to 60 characters), **When** displayed, **Then** the text wraps or scales to maintain readability without overlapping UI.

---

### User Story 3 - Next trophy navigation (Priority: P2)

Provide a clear "Next Trophy" control to advance to the next available trophy in the current session.

**Why this priority**: Enables presenters to move through multiple trophies quickly; supports ceremonies.

**Independent Test**: With a session containing multiple trophies, click the Next control; the UI shows the next trophy, updates text and animation, and prevents advancing past the end.

**Acceptance Scenarios**:

1. **Given** a session with 3 trophies and the first is displayed, **When** the user clicks "Next Trophy", **Then** the second trophy fully replaces the current with updated names and achievement.
2. **Given** the final trophy is displayed, **When** the user clicks "Next Trophy", **Then** the control is disabled or shows an unobtrusive message that no more trophies remain.
3. **Given** a network delay while fetching the next trophy, **When** the next is requested, **Then** a subtle loading indicator is visible until content is ready.

---

### Edge Cases

- Missing `giverName`: Display "From: Anonymous" and continue presentation.
- Extremely long receiver/achievement: Apply truncation with tooltip or multi-line wrap to preserve layout.
- No trophies available: Show an empty state with guidance to create or refresh.
- Confetti performance: Limit particle count and duration to avoid jank on low-end devices.
- Large trophy sessions: Support unlimited trophies with efficient navigation; ensure performance does not degrade with session size.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Trigger a celebratory confetti effect the first time the trophy component reaches 50% visibility in the viewport during a presentation.
- **FR-002**: Prevent confetti from retriggering more than once within a single continuous viewing session of the same trophy.
- **FR-003**: Render the trophy as a 2D element with a continuous spin animation at 8 seconds per full rotation.
- **FR-004**: Display receiver name and achievement text prominently associated with the trophy, maintaining readability on desktop displays.
- **FR-005**: Display the giver name adjacent to the trophy with the label "From:".
- **FR-006**: Provide a "Next Trophy" control that advances to the next trophy in the session and updates all displayed fields and animation state.
- **FR-007**: Disable or visually indicate the end of list state when no subsequent trophy exists; do not throw errors to the user.
- **FR-008**: Handle missing or optional fields gracefully using defaults: receiver "Recipient", achievement "Achievement", giver "Anonymous".
- **FR-009**: Ensure text does not overlap the trophy; apply responsive wrapping or scaling for long strings up to 60 characters.
- **FR-010**: Expose a lightweight loading indicator when transitioning to the next trophy if data is not immediately available.
- **FR-011**: Confetti effect MUST complete within 2 seconds, maintain 30fps minimum frame rate, and render smoothly without blocking interactions.
- **FR-012**: Accessibility: trophy text and labels must have sufficient contrast (WCAG AA) and be readable via screen reader semantics.
- **FR-013**: State reset: when advancing to the next trophy, confetti can trigger again upon the new trophy entering the viewport.

- **FR-014**: Confetti effect MUST be standardized on the `canvas-confetti` library for consistent behavior across browsers (no implementation details in this spec beyond the choice).

### Key Entities *(include if feature involves data)*

- **TrophyPresentation**: receiverName, achievementTitle, giverName, sessionId, trophyId, displayOrder.
- **PresentationSession**: sessionId, trophies[] ordered, currentIndex.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of trophy reveals show confetti within 1 second of entering view.
- **SC-002**: 90% of users report names and achievements are legible at normal viewing distances (qualitative via feedback prompt or observation).
- **SC-003**: Users can advance through a 5-trophy session in under 30 seconds without errors.
- **SC-004**: Text overflow does not visually overlap the trophy image on desktop displays (1920px standard resolution).
- **SC-005**: Confetti renders smoothly with no visible stutter on mid-tier hardware during presentation (observational test with sample devices).

## Assumptions

- The presentation page already exists and can detect viewport entry for the trophy component.
- Sessions provide ordered trophies with `receiverName`, `achievementTitle`, and optional `giverName`.
- A commonly used browser-based confetti library is available and permitted.
- Animation preferences respect reduced-motion OS setting, disabling spin and confetti for users who prefer reduced motion.

## Dependencies

- Trophy data from existing session/trophies services.
- A confetti library suitable for web browsers.

## Out of Scope

- 3D model rendering; this feature focuses on 2D representation only.
- Custom artwork upload or editing.

## Clarifications

### Session 2025-12-13

- Q: Should FR-014 specify the exact confetti library or remain tech-agnostic? → A: Keep explicit: standardize on `canvas-confetti`.
- Q: What frame rate should confetti maintain for smooth rendering? → A: Maintain 30fps minimum during confetti effect
- Q: What should the trophy rotation speed be? → A: 8 seconds per rotation
- Q: What breakpoints should be tested for responsive text? → A: Desktop-only (1920px), responsiveness low priority
- Q: Maximum trophies per session? → A: No limit
- Q: Viewport visibility threshold for confetti trigger? → A: 50% visible
