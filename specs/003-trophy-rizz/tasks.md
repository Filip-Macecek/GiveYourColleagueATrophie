# Tasks: Trophy Rizz Presentation

**Input**: Design documents from `/specs/003-trophy-rizz/`  
**Feature**: Trophy Rizz Presentation with confetti, 2D spinning trophy, and next trophy navigation  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: NOT REQUESTED - No test tasks included per feature specification

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Web application structure:
- Frontend: `frontend/src/`, `frontend/tests/`
- Backend: No changes needed (uses existing endpoints)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install confetti library and prepare project structure

- [X] T001 Install canvas-confetti dependency in frontend/package.json via npm install
- [X] T002 [P] Verify existing TrophyPresentation component location in frontend/src/components/TrophyPresentation.tsx
- [X] T003 [P] Verify existing session hooks and services in frontend/src/hooks/ and frontend/src/services/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core viewport detection and confetti infrastructure that enables all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create useIntersectionObserver custom hook in frontend/src/hooks/useIntersectionObserver.ts with 50% visibility threshold and rootMargin support
- [X] T005 [P] Create useConfetti custom hook in frontend/src/hooks/useConfetti.ts with canvas-confetti integration, 30-second throttle logic, and trophyId-keyed state
- [X] T006 Add prefers-reduced-motion media query detection utility in frontend/src/hooks/useConfetti.ts to disable confetti when user prefers reduced motion

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Confetti on Trophy Reveal (Priority: P1) 🎯 MVP

**Goal**: Trigger celebratory confetti burst when trophy enters viewport, respecting 30-second throttle and reduced-motion preferences

**Independent Test**: Load presentation page with trophy off-screen, scroll to bring trophy into view (50%+ visible), verify confetti burst triggers within 1 second, scroll away and back within 30 seconds to confirm no retrigger

### Implementation for User Story 1

- [X] T007 [US1] Integrate useIntersectionObserver hook into TrophyPresentation component in frontend/src/components/TrophyPresentation.tsx to detect when trophy reaches 50% viewport visibility
- [X] T008 [US1] Connect useConfetti hook to TrophyPresentation in frontend/src/components/TrophyPresentation.tsx and trigger confetti when IntersectionObserver fires viewport entry event
- [X] T009 [US1] Configure canvas-confetti burst parameters in useConfetti hook (80-120 particles, 2-second max duration, 30fps target) per research.md decisions
- [X] T010 [US1] Add confetti trigger state tracking in TrophyPresentation keyed by trophyId to prevent retrigger within 30 seconds for same trophy
- [X] T011 [US1] Implement reduced-motion check in useConfetti to skip confetti when prefers-reduced-motion: reduce is active

**Checkpoint**: Confetti triggers correctly on trophy reveal, respects throttle and accessibility preferences

---

## Phase 4: User Story 2 - 2D Spinning Trophy with Names (Priority: P1)

**Goal**: Display 2D trophy with 8-second spin animation, overlay receiver name and achievement, show giver name adjacent with "From:" label, handle long text gracefully

**Independent Test**: Load TrophyPresentation with sample data (receiverName: "Alex Kim", achievementTitle: "Top Mentor", giverName: "Jordan"), confirm 2D trophy spins smoothly at 8-second rotation, names and achievement display legibly on/near trophy without overlap, "From: Jordan" appears adjacent

### Implementation for User Story 2

- [X] T012 [P] [US2] Create CSS keyframe animation for 8-second continuous spin in frontend/src/components/TrophyPresentation.css with prefers-reduced-motion override to disable spin
- [X] T013 [P] [US2] Replace existing 3D trophy rendering with 2D SVG/image trophy element in frontend/src/components/TrophyPresentation.tsx
- [X] T014 [US2] Add CSS layout for receiver name and achievement text overlay on trophy in frontend/src/components/TrophyPresentation.css with max-width, text wrapping, and responsive scaling for up to 60 characters
- [X] T015 [US2] Add "From: {giverName}" label adjacent to trophy in frontend/src/components/TrophyPresentation.tsx with fallback to "From: Anonymous" if giverName missing or empty
- [X] T016 [US2] Apply default values in TrophyPresentation component: receiverName defaults to "Recipient", achievementTitle defaults to "Achievement", giverName defaults to "Anonymous" when missing or empty
- [X] T017 [US2] Add WCAG AA contrast check to trophy text styles in frontend/src/components/TrophyPresentation.css and ensure aria-label with receiver, achievement, and giver for screen reader accessibility
- [X] T018 [US2] Add tooltip or multi-line wrap for text overflow beyond 60 characters in frontend/src/components/TrophyPresentation.css to prevent overlap with trophy image

**Checkpoint**: Trophy displays in 2D with smooth spin, all names and achievement visible and legible, defaults applied correctly, accessibility requirements met

---

## Phase 5: User Story 3 - Next Trophy Navigation (Priority: P2)

**Goal**: Enable "Next Trophy" button to advance through session trophies, update displayed trophy data and animation state, disable at end of list, show loading indicator during transitions

**Independent Test**: Load session with 3 trophies, display first trophy, click "Next Trophy", confirm second trophy renders with updated names/achievement and confetti resets (can trigger again), click Next again to reach third trophy, verify Next button disabled when at final trophy

### Implementation for User Story 3

- [X] T019 [P] [US3] Add currentIndex state to TrophyPresentation or parent presentation page component in frontend/src/components/TrophyPresentation.tsx (or frontend/src/pages/[presentation-page].tsx)
- [X] T020 [P] [US3] Create "Next Trophy" button UI in frontend/src/components/TrophyPresentation.tsx or presentation page with clear label and styling
- [X] T021 [US3] Implement next trophy handler function that increments currentIndex and fetches/displays next trophy from session trophies array using existing session hooks
- [X] T022 [US3] Add disabled state logic to "Next Trophy" button when currentIndex equals trophies.length - 1 (final trophy reached) in frontend/src/components/TrophyPresentation.tsx
- [X] T023 [US3] Reset confetti trigger state in useConfetti when currentIndex changes to allow confetti to fire again for new trophy
- [X] T024 [US3] Add loading indicator (spinner or shimmer) during next trophy transition if data fetch is pending in frontend/src/components/TrophyPresentation.tsx
- [X] T025 [US3] Display unobtrusive end-of-list message when Next is clicked on final trophy in frontend/src/components/TrophyPresentation.tsx (e.g., "No more trophies")
- [X] T026 [US3] Update trophy data (receiverName, achievementTitle, giverName) and displayOrder when next trophy is loaded to refresh UI with new content

**Checkpoint**: All user stories complete - confetti works, trophy spins with correct data, next navigation functions correctly with proper end-of-list handling

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T027 [P] Add performance optimization: verify confetti completes within 2 seconds and maintains 30fps minimum per FR-011
- [X] T028 [P] Add performance optimization: verify trophy navigation completes within 500ms per plan.md performance goals
- [X] T029 Code review: ensure all default values (Recipient, Achievement, Anonymous) are consistently applied across all trophy displays
- [X] T030 [P] Documentation: update frontend/README.md with canvas-confetti usage notes and reduced-motion behavior
- [X] T031 Accessibility audit: verify all WCAG AA contrast requirements met and screen reader semantics correct for trophy text and navigation controls
- [X] T032 Run quickstart.md validation with multi-trophy session to confirm confetti, spinning trophy, and next navigation all work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T003) - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion (T004-T006)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2): US1 → US2 → US3
- **Polish (Phase 6)**: Depends on all desired user stories being complete (T007-T026)

### User Story Dependencies

- **User Story 1 (P1 - Confetti)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1 - 2D Trophy)**: Can start after Foundational (Phase 2) - Independent of US1, but naturally integrates with same TrophyPresentation component
- **User Story 3 (P2 - Navigation)**: Can start after Foundational (Phase 2) - Integrates with US1 (confetti reset) and US2 (trophy data update) but independently testable

### Within Each User Story

**User Story 1 (Confetti):**
- T007 → T008 (must detect viewport before triggering confetti)
- T009, T010, T011 can proceed in parallel after T008

**User Story 2 (2D Trophy):**
- T012, T013 can run in parallel (CSS and component structure)
- T014-T018 should follow T013 (need trophy element to exist before adding text overlays)

**User Story 3 (Navigation):**
- T019, T020 can run in parallel (state and UI)
- T021-T026 should follow T019 and T020

### Parallel Opportunities

**Phase 1 (Setup):**
- T002, T003 can run in parallel

**Phase 2 (Foundational):**
- T004, T005 can run in parallel (different hooks)
- T006 can run after T005 (adds to useConfetti hook)

**Phase 3 (User Story 1):**
- T009, T010, T011 can run in parallel after T008

**Phase 4 (User Story 2):**
- T012, T013 can run in parallel
- T015, T016, T017, T018 can run in parallel after T014

**Phase 5 (User Story 3):**
- T019, T020 can run in parallel

**Phase 6 (Polish):**
- T027, T028, T030, T031 can all run in parallel

**Cross-Story Parallel:**
Once Foundational (Phase 2) completes, User Stories 1, 2, and 3 can all be worked on in parallel by different team members (though US2 and US1 will naturally touch the same TrophyPresentation component and should coordinate)

---

## Parallel Example: User Story 2 (2D Trophy)

```bash
# After T013 completes, launch these in parallel:
Task T015: "Add 'From: {giverName}' label adjacent to trophy"
Task T016: "Apply default values in TrophyPresentation component"
Task T017: "Add WCAG AA contrast check and aria-label"
Task T018: "Add tooltip or multi-line wrap for text overflow"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only - Both P1)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006) - CRITICAL
3. Complete Phase 3: User Story 1 - Confetti (T007-T011)
4. Complete Phase 4: User Story 2 - 2D Trophy (T012-T018)
5. **STOP and VALIDATE**: Test confetti + spinning trophy independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Confetti) → Test independently → Deploy/Demo
3. Add User Story 2 (2D Trophy) → Test with US1 → Deploy/Demo (MVP!)
4. Add User Story 3 (Navigation) → Test all stories together → Deploy/Demo (Full feature!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Confetti) - T007-T011
   - Developer B: User Story 2 (2D Trophy) - T012-T018
   - Developer C: User Story 3 (Navigation) - T019-T026
3. Note: Developers A and B should coordinate as both touch TrophyPresentation.tsx
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests requested per feature specification - focus on implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US1 + US2 together form the MVP (both P1 priority)
- US3 adds presenter convenience but not required for initial value
- All animation and confetti respect prefers-reduced-motion for accessibility
- MVP: Deliver US1 (confetti trigger on reveal). Then US2 (2D trophy with names), then US3 (Next navigation). Incrementally add tests as per constitution.
