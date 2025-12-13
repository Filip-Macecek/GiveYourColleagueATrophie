# Feature Specification: Trophy Refresh and Presentation Controls

**Feature Branch**: `002-trophy-refresh-button`  
**Created**: December 13, 2025  
**Status**: Draft  
**Input**: User description: "The session page will have "Refresh trophies" button that will fetch all the trophies in the session. If there are more than 1 trophy, the button Present Trophies should appear."

## Clarifications

### Session 2025-12-13

- Q: When should automatic polling for new trophies be active? → A: Poll continuously but pause after 5 minutes of inactivity (resume on any user interaction)
- Q: Should users receive visual feedback that automatic polling is active? → A: Visual indicator (passive)
- Q: Should the UI display when the trophy list was last updated? → A: Yes, show timestamp with every update (e.g., "Updated 3 seconds ago")
- Q: What should the automatic polling interval be? → A: Change to 3 seconds for better server efficiency while maintaining near-real-time feel
- Q: When new trophies appear via automatic polling, should there be visual feedback to highlight the change? → A: Yes, briefly highlight new trophies (e.g., fade-in animation or subtle background flash)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Refresh Trophy List (Priority: P1)

As a session host or participant, I want the trophy list to refresh automatically and have the option to manually refresh, so that I can stay updated on new trophies in real-time without constant manual intervention.

**Why this priority**: This is the core functionality that provides immediate value. Automatic polling ensures users see new trophies as they arrive, while manual refresh gives users control. Without this, users must reload the entire page or navigate away and back to see new trophies, creating a poor user experience.

**Independent Test**: Can be fully tested by opening a session page, having another user submit a trophy, waiting for automatic refresh (every 3 seconds while active), and verifying the new trophy appears without page reload. Manual refresh can also be tested by clicking the "Refresh trophies" button. Delivers immediate value by keeping the trophy list current automatically.

**Acceptance Scenarios**:

1. **Given** I am viewing a session page with existing trophies, **When** I click the "Refresh trophies" button, **Then** the system fetches the latest trophy data and updates the display
2. **Given** a new trophy has been submitted to the session by another user, **When** I click the "Refresh trophies" button, **Then** the new trophy appears in my trophy list
3. **Given** I am viewing a session with no trophies, **When** I click the "Refresh trophies" button, **Then** the system fetches data and displays an appropriate message (e.g., "No trophies yet")
4. **Given** I click the "Refresh trophies" button, **When** the fetch operation is in progress, **Then** the button shows a loading state to indicate the operation is processing
5. **Given** the trophy fetch operation fails, **When** I click the "Refresh trophies" button, **Then** I see an error message and the existing trophy list remains unchanged
6. **Given** I am viewing the session page, **When** the page loads, **Then** automatic polling starts and fetches trophies every 3 seconds
7. **Given** automatic polling is active, **When** a new trophy is submitted by another user, **Then** the new trophy appears in my list within 3 seconds without manual action
8. **Given** I have been inactive for 5 minutes, **When** the inactivity timeout is reached, **Then** automatic polling pauses
9. **Given** automatic polling is paused due to inactivity, **When** I interact with the page (mouse move, click, key press), **Then** automatic polling resumes immediately
10. **Given** automatic polling is running, **When** I navigate away from the session page, **Then** polling stops to conserve resources
11. **Given** I am viewing the session page, **When** automatic polling is active, **Then** I see a subtle visual indicator (e.g., pulsing dot or "Live" badge) showing that updates are happening automatically
12. **Given** automatic polling is paused due to inactivity, **When** I view the session page, **Then** the visual indicator reflects the paused state or is hidden
13. **Given** the trophy list has been updated (manually or automatically), **When** I view the session page, **Then** I see a timestamp showing when the list was last updated (e.g., "Updated 3 seconds ago")
14. **Given** time passes after a trophy list update, **When** I continue viewing the session page, **Then** the timestamp updates dynamically to reflect elapsed time (e.g., "Updated 5 seconds ago", "Updated 1 minute ago")
15. **Given** new trophies are added via automatic polling, **When** they appear in my trophy list, **Then** they are briefly highlighted with a visual effect (e.g., fade-in animation or subtle background flash) to draw my attention to the new content

---

### User Story 2 - Access Trophy Presentation Mode (Priority: P2)

As a session host, I want to see a "Present Trophies" button when there are multiple trophies in the session, so that I can transition to presentation mode and showcase all submissions to the group.

**Why this priority**: This enables the presentation workflow but requires at least P1 (refresh) to ensure users can load trophies before presenting. It's independent but builds on P1's value.

**Independent Test**: Can be tested independently by creating a session with 2 or more trophies, viewing the session page, and verifying the "Present Trophies" button appears and successfully navigates to presentation mode. Delivers value by enabling group review of multiple submissions.

**Acceptance Scenarios**:

1. **Given** I am viewing a session page with 2 or more trophies, **When** the page loads or trophies are refreshed, **Then** I see a "Present Trophies" button
2. **Given** I am viewing a session page with exactly 1 trophy, **When** the page loads or trophies are refreshed, **Then** the "Present Trophies" button does not appear
3. **Given** I am viewing a session page with 0 trophies, **When** the page loads or trophies are refreshed, **Then** the "Present Trophies" button does not appear
4. **Given** I see the "Present Trophies" button on the session page, **When** I click it, **Then** I am taken to the presentation view for that session
5. **Given** I have 1 trophy and refresh the trophy list, **When** a second trophy is fetched, **Then** the "Present Trophies" button appears dynamically

---

### Edge Cases

- What happens when the refresh operation is triggered while another refresh is already in progress? (System should either queue the request or ignore subsequent clicks until the first completes)
- How does the system handle network timeouts during trophy refresh? (Display error message, keep existing data visible, polling continues)
- What happens if all trophies are deleted from a session while viewing it? (After refresh, show "No trophies yet" and hide the "Present Trophies" button)
- What happens if exactly 1 trophy exists and the "Present Trophies" button is showing, but then that trophy is deleted before clicking? (Button should disappear after next refresh, or gracefully handle the scenario in presentation mode)
- What happens if automatic polling encounters repeated failures? (Continue polling but consider exponential backoff to avoid hammering the server; show persistent error indicator)
- What happens if user manually clicks "Refresh trophies" while automatic polling is also running? (Manual refresh should not conflict; either deduplicate or allow both, ensuring UI consistency)
- What happens when user activity resumes after inactivity timeout? (Polling resumes immediately and fetches latest data)
- What happens if the user quickly switches between active and inactive states? (System should debounce inactivity detection to avoid rapid start/stop cycles)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The session page MUST display a "Refresh trophies" button that is visible and accessible at all times
- **FR-002**: When the "Refresh trophies" button is clicked, the system MUST fetch all trophies associated with the current session
- **FR-003**: The system MUST update the trophy display with the fetched data without requiring a full page reload
- **FR-004**: The "Refresh trophies" button MUST provide visual feedback (loading state) during the fetch operation
- **FR-005**: If the trophy fetch operation fails, the system MUST display an error message to the user and preserve the existing trophy list
- **FR-006**: The session page MUST conditionally display a "Present Trophies" button when the session contains 2 or more trophies
- **FR-007**: The "Present Trophies" button MUST NOT be visible when the session contains 0 or 1 trophy
- **FR-008**: The visibility of the "Present Trophies" button MUST update dynamically when the trophy count changes (e.g., after a refresh operation)
- **FR-009**: When the "Present Trophies" button is clicked, the system MUST navigate the user to the presentation view for the current session
- **FR-010**: The system MUST handle concurrent refresh operations gracefully (either queue or ignore duplicate requests)
- **FR-011**: The system MUST automatically poll for new trophies every 3 seconds when the session page is loaded
- **FR-012**: Automatic polling MUST pause after 5 minutes of user inactivity (no mouse movement, clicks, or key presses)
- **FR-013**: Automatic polling MUST resume immediately when user activity is detected after an inactivity pause
- **FR-014**: Automatic polling MUST stop completely when the user navigates away from the session page
- **FR-015**: The system MUST update the trophy display and "Present Trophies" button visibility after each automatic poll, consistent with manual refresh behavior
- **FR-016**: The session page MUST display a subtle, non-intrusive visual indicator (e.g., pulsing dot, "Live" badge) when automatic polling is active
- **FR-017**: The visual indicator MUST reflect the polling state (active vs. paused) or be hidden when polling is paused
- **FR-018**: The session page MUST display a timestamp showing when the trophy list was last updated after each refresh (manual or automatic)
- **FR-019**: The timestamp MUST update dynamically to show relative time (e.g., "Updated 3 seconds ago", "Updated 2 minutes ago") and remain accurate as time passes
- **FR-020**: When new trophies appear via automatic polling, the system MUST briefly highlight them with a non-intrusive visual effect (e.g., fade-in animation or subtle background flash) to indicate new content

### Key Entities

- **Trophy**: Represents a user submission within a session; includes data sufficient to display in a list and present to viewers
- **Session**: A collection of trophies; the container that determines whether presentation mode is available

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can refresh the trophy list with a single click and see updated results within 3 seconds under normal network conditions
- **SC-002**: The "Present Trophies" button appears automatically when a session reaches 2 trophies, without requiring page reload or manual refresh
- **SC-003**: 95% of refresh operations (both manual and automatic) complete successfully, with clear error messaging for the remaining 5%
- **SC-004**: Users can transition from session view to presentation view in under 2 seconds when clicking "Present Trophies"
- **SC-005**: The refresh operation (manual or automatic) does not disrupt the user's current scroll position or selected trophy (maintains UI state)
- **SC-006**: New trophies submitted by other users appear automatically within 3 seconds for active users (those who have interacted in the last 5 minutes)
- **SC-007**: Automatic polling pauses within 1 second of the 5-minute inactivity threshold being reached
- **SC-008**: Automatic polling resumes within 1 second of user activity after an inactivity pause
- **SC-009**: The visual indicator for automatic polling is visible but non-intrusive, not obscuring trophy content or primary actions
- **SC-010**: The "last updated" timestamp is clearly visible and updates accurately, providing users confidence that the data is current
- **SC-011**: New trophies added via automatic polling are highlighted in a way that draws attention without being disruptive or jarring to the user experience
