# Feature Specification: Trophy Presentation Improvements

**Feature Branch**: `[005-trophy-presentation-improvements]`  
**Created**: December 16, 2025  
**Status**: Draft  
**Input**: User description: "Currently, the whole experience is a bit underwhelming. We need to make it better. First of all, when we are on the session screen, make sure we hide the information about trophies, so that it is a secret until the present button is pressed. Second, let's make changes to the way the trophies are presented. First, make the trophy bigger, so that it feels majority of the screen, second, let's make the text more readable by putting it below the trophy and make sure there is a contrast in font colours and background."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hide Trophy Details on Submission Page (Priority: P0)

When viewing the submission page (where team members nominate trophies), the trophy recipient names and achievement text should remain hidden to preserve the surprise. The submitter/author name (e.g., "by Adam") MUST be shown so users know who nominated the trophy.

**Why this priority**: This is critical for maintaining excitement and anticipation. Revealing recipient/achievement details too early diminishes the impact of the presentation.

**Independent Test**: Navigate to the submission page with existing trophies; verify that recipient names and achievement text are not visible, but submitter names ("by [Name]") ARE shown.

**Acceptance Scenarios**:

1. **Given** a session with 5 submitted trophies on the submission page, **When** a user views the trophies list, **Then** the trophy count, display order, and submitter name ("by Adam") are visible, while recipient names and achievement text are completely hidden.
2. **Given** the submission page with hidden trophy details, **When** a new trophy is submitted, **Then** the count increments but the new trophy details remain hidden.
3. **Given** trophy details are hidden, **When** the user clicks "Present Trophies", **Then** they navigate to the presentation page where full details are revealed.

---

### User Story 2 - Enlarged Trophy Display (Priority: P0)

Display the trophy at a significantly larger size occupying the majority of the screen during presentation to create an impressive visual impact. Optimized for desktop 1080p displays only.

**Why this priority**: The trophy is the centerpiece of the experience. Making it dominant enhances emotional resonance and perceived value.

**Independent Test**: Open presentation page on desktop (1920x1080); verify trophy occupies at least 60% of viewport height and centers prominently.

**Acceptance Scenarios**:

1. **Given** a presentation page is loaded on a desktop display (1920x1080), **When** a trophy is shown, **Then** the trophy visual occupies at least 60% of the viewport height and is horizontally centered.
2. **Given** a maximized browser window, **When** the trophy is displayed, **Then** there is balanced whitespace around the trophy without feeling cramped or lost in space.

---

### User Story 3 - Improved Text Placement and Readability (Priority: P0)

Move trophy text (recipient name, achievement, giver info) below the trophy visual with enhanced contrast and readability using clear backgrounds and appropriate font colors. Optimized for desktop 1080p displays.

**Why this priority**: Current overlay text can be hard to read. Separating text improves legibility and ensures all users can comfortably read the information.

**Independent Test**: Load presentation with sample trophies on desktop (1920x1080); verify text appears below trophy with good contrast.

**Acceptance Scenarios**:

1. **Given** a trophy is displayed in presentation mode on desktop (1920x1080), **When** the page renders, **Then** the recipient name, achievement text, and giver name appear below the trophy visual (not overlaid).
2. **Given** text appears below the trophy, **When** viewed on desktop, **Then** the text has a contrasting background (e.g., white panel) and font color ensures WCAG AA contrast ratio.
3. **Given** long recipient names or achievement text, **When** displayed, **Then** text wraps cleanly without overflow.
4. **Given** the trophy text section, **When** rendered on desktop, **Then** the recipient name is displayed in a large, bold font (32px+), achievement text in readable size (20px+), and giver info in slightly smaller size (16px+).

---

### Edge Cases

- Very long trophy text: Apply wrapping and ensure no horizontal scrolling on desktop (1920x1080).
- Missing data fields: Continue to use defaults (Recipient, Achievement, Anonymous) with proper styling.
- Missing submitter name: Display "by Anonymous" on submission page.
- Accessibility: Ensure screen readers announce trophy and text correctly; maintain keyboard navigation support.

## Requirements *(mandatory)*

### Functional Requirements

#### Trophy Details Hiding

- **FR-001**: The submission page (SubmissionPage.tsx) MUST hide recipient names and achievement text from the trophy list display.
- **FR-002**: The submission page MUST show the trophy display order number and the submitter/author name (e.g., "by Adam") for each trophy.
- **FR-003**: The hidden trophy items MUST still be visually distinct and countable so users can track submission progress.
- **FR-004**: Trophy details MUST remain accessible via the presentation page only; no accidental reveal through UI interactions on the submission page.
- **FR-005**: The "Present Trophies" button logic remains unchanged; it appears when 2+ trophies exist regardless of detail visibility.

#### Enlarged Trophy Display

- **FR-006**: The TrophyPresentation component MUST render the trophy visual at a size that occupies a minimum of 60% viewport height on desktop 1080p displays (1920x1080).
- **FR-007**: The trophy icon/emoji size MUST increase to at least 200px to enhance visual impact.
- **FR-008**: The trophy visual container MUST maintain a balanced aspect ratio (1:1) and be horizontally centered.
- **FR-009**: Surrounding whitespace MUST be minimized to allow the trophy to dominate the screen while maintaining a clean aesthetic.

#### Improved Text Placement and Readability

- **FR-010**: Recipient name, achievement text, and giver info MUST be positioned below the trophy visual, not overlaid on top.
- **FR-011**: The text section MUST have a contrasting background panel (solid white) to ensure readability.
- **FR-012**: Font colors MUST provide at least WCAG AA contrast ratio against the white background.
- **FR-013**: Recipient name MUST be displayed in a large, bold font (42px) to emphasize recognition.
- **FR-014**: Achievement text MUST be displayed in a readable size (24px) with clear line height.
- **FR-015**: Giver info MUST be displayed in a smaller, italicized font (18px) to differentiate from main content.
- **FR-016**: Text MUST wrap cleanly for long strings; no horizontal scrolling or clipping allowed.
- **FR-017**: The text section MUST have adequate padding (32px) to prevent text from touching edges.

#### Accessibility and Polish

- **FR-018**: All text MUST remain accessible to screen readers with proper semantic HTML and ARIA labels.
- **FR-019**: The enlarged trophy MUST not cause layout shifts or reflows that disrupt user experience.
- **FR-020**: Confetti animation MUST continue to trigger on trophy entry as per existing behavior.
- **FR-021**: The spin animation (8 seconds per rotation) MUST be preserved with the larger trophy size.

### Key Entities *(include if feature involves data)*

No new entities required. Existing data models remain unchanged:

- **TrophySubmission**: id, recipientName, achievementText, submitterName, displayOrder
- **Session**: sessionCode, status, trophies[]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of trophy recipient names and achievement text are hidden on the submission page; submitter names ("by [Name]") are shown.
- **SC-002**: Trophy visual occupies 60-70% of viewport height on desktop 1080p (1920x1080) as measured in browser DevTools.
- **SC-003**: Text below trophy achieves WCAG AA contrast ratio verified using Color Contrast Analyzer.
- **SC-004**: Font sizes are 42px (recipient name), 24px (achievement text), 18px (giver info) as verified in browser inspector.
- **SC-005**: Trophy presentation loads without layout shifts or jank on desktop.
- **SC-006**: Users can read trophy text from 2-3 feet away on a 24" monitor.
- **SC-007**: Interactive elements remain keyboard-accessible and screen-reader-friendly.

## Assumptions

- The submission page is the primary location where trophy details need to be hidden; submitter names remain visible.
- Desktop 1080p (1920x1080) is the only target environment; no responsive design required.
- The confetti effect and existing animations remain unchanged in behavior.
- Users have modern desktop browsers (Chrome, Firefox, Safari).
- The 2D trophy emoji (🏆) will continue to be used; no 3D model integration required.

## Out of Scope

- Implementing 3D trophy models or advanced graphics.
- Adding new backend APIs or modifying data structures.
- Changing the confetti library or animation behavior beyond adapting to new layout.
- Creating a completely new theme or color scheme; only adjusting contrast for readability.
- Adding trophy detail editing or deletion features.
- Implementing trophy preview mode or partial reveals on submission page.

## Dependencies

- No backend changes required.
- Relies on existing React components: `TrophyPresentation.tsx`, `SubmissionPage.tsx`.
- Uses existing CSS files: `TrophyPresentation.css`, `SubmissionPage.css`.
- Requires testing on multiple viewport sizes and browsers.

## Technical Considerations

- **CSS Layout**: Use CSS Grid or Flexbox for positioning text below trophy; use viewport units (vh) for trophy sizing.
- **Contrast**: Use white background panel for text with dark text colors.
- **Font Sizing**: Use px units for fixed sizes (42px, 24px, 18px).
- **Accessibility**: Maintain semantic HTML and ARIA labels; test with screen readers.
- **Performance**: Use CSS transforms for animations.

## Rollback Plan

If issues arise (e.g., readability problems, layout breaks on specific devices):

1. Revert CSS changes to TrophyPresentation.css to restore original overlay layout.
2. Revert SubmissionPage.tsx to show trophy details if hiding causes confusion (though this undermines the feature goal).
3. Adjust font sizes or background colors based on user feedback without reverting the entire feature.

## Clarifications

### Session 2025-12-16

- Q: Should the submitter/author name ("by Adam") be shown on the submission page trophy list? → A: Yes, show the author name
- Q: Should the implementation include responsive design for mobile and tablet devices? → A: No, don't care about responsiveness
- Q: What screen sizes should be optimized for? → A: Only optimize for desktop 1080p (1920x1080)
- Q: Should the specification document include extensive details and multiple options? → A: Keep the spec document simple

## Follow-Up Enhancements (Future)

- Add theme customization allowing organizers to choose light/dark text backgrounds.
- Implement animated transitions when trophy text slides in from below.
- Explore 3D trophy models or SVG graphics for more visual variety.
- Add responsive design for mobile and tablet devices.

---

**Prepared by**: GitHub Copilot (AI Assistant)  
**Review Status**: Awaiting stakeholder approval
