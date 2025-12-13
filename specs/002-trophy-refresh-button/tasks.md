# Tasks: Trophy Refresh and Presentation Controls

**Input**: Design documents from `/specs/002-trophy-refresh-button/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅

**Tests**: Test tasks included per Constitution Principle III (Test-First Happy Path - MANDATORY)

**Organization**: Tasks grouped by user story (US1, US2) to enable independent implementation and testing

## Format: `[ID] [P?] [Story] Description with file path`

- **[ID]**: Task identifier (T001, T002, etc.) in execution order
- **[P]**: Can run in parallel (different files, no cross-dependencies)
- **[Story]**: User story label (US1, US2) for user story tasks only
- **File paths**: Exact paths for implementation artifacts

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project infrastructure and API contract validation

- [X] T001 Verify or create `GET /api/sessions/{id}/trophies` endpoint in `backend/src/Controllers/SessionsController.cs` per OpenAPI contract
- [X] T002 [P] Configure `frontend/src/services/api.ts` to include trophy fetch function for polling
- [X] T003 [P] Create `frontend/src/hooks/` directory structure for custom hooks
- [X] T004 Verify Vitest configuration in `frontend/vitest.config.ts` includes test library setup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hooks and utilities that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 2A: Inactivity Detection Hook (Blocking for US1)

- [X] T005 Create `frontend/src/hooks/useInactivity.ts` with activity event listeners (mousemove, keydown, click) and 5-minute timeout
- [X] T006 [P] Write unit test for `useInactivity` in `frontend/tests/unit/useInactivity.test.ts` - test timeout trigger and activity reset
- [X] T007 [P] Write unit test for `useInactivity` - test event listener cleanup on unmount

### 2B: Relative Time Hook (Blocking for US1)

- [X] T008 Create `frontend/src/hooks/useRelativeTime.ts` with dynamic time formatting ("just now", "X seconds ago", "X minutes ago")
- [X] T009 [P] Write unit test for `useRelativeTime` in `frontend/tests/unit/useRelativeTime.test.ts` - test formatting at various time intervals
- [X] T010 [P] Write unit test for `useRelativeTime` - test 1-second update interval

### 2C: API Trophy Fetch Function (Blocking for US1)

- [X] T011 Add `getTrophies(sessionId: string)` async function to `frontend/src/services/api.ts` that calls `GET /api/sessions/{id}/trophies`
- [X] T012 Add error handling and retry logic to trophy fetch function (log errors, return empty array on failure)

**Checkpoint**: Foundational hooks and API layer ready - user story work can now begin

---

## Phase 3: User Story 1 - Refresh Trophy List (Priority: P1) 🎯 MVP

**Goal**: Enable automatic trophy polling every 3 seconds with manual refresh button, inactivity pause after 5 minutes, visual "LIVE/SNOOZING" indicator, dynamic "Updated X seconds ago" timestamp, and fade-in animation for new trophies.

**Independent Test**: Open session page, verify polling starts; submit trophy from another tab, verify it appears in <3 seconds with highlight; wait 5 minutes idle, verify "SNOOZING" badge and polling pauses; interact with page, verify "LIVE" badge and polling resumes; click manual refresh, verify list updates immediately with "Updated just now" timestamp.

### 3A: Enhanced useTrophies Hook (Polling Lifecycle)

- [X] T013 Extend `frontend/src/hooks/useTrophies.ts` with polling state: `isRefreshing`, `lastUpdated`, `error`
- [X] T014 [P] Add polling logic using `setInterval(3000)` in useEffect, respecting `pollingEnabled` parameter
- [X] T015 [P] Implement fetch function with try-catch, set `isRefreshing: true/false` around API call
- [X] T016 [P] Update `lastUpdated` timestamp on successful fetch, clear error state
- [X] T017 [P] Set error message on fetch failure, preserve existing trophies (don't clear on error)
- [X] T018 Return `refetch()` function as manual refresh callback

### 3B: Tests for User Story 1 (Test-First - Write BEFORE Implementation)

- [X] T019 Write contract test for `GET /api/sessions/{id}/trophies` in `frontend/tests/integration/trophy-api.test.ts` - verify response matches OpenAPI schema
- [X] T020 [P] Write integration test for polling lifecycle in `frontend/tests/integration/polling.test.ts` - polling starts on mount, fetches every 3s
- [X] T021 [P] Write integration test for manual refresh in `frontend/tests/integration/polling.test.ts` - refetch() updates list immediately
- [X] T022 [P] Write integration test for inactivity pause in `frontend/tests/integration/polling.test.ts` - polling pauses after 5 min, resumes on activity
- [X] T023 [P] Write integration test for error handling in `frontend/tests/integration/polling.test.ts` - error preserved, polling continues

### 3C: RefreshButton Component

- [X] T024 Create `frontend/src/components/RefreshButton.tsx` with button showing "🔄 Refresh Trophies" or "⏳ Refreshing..." when `isRefreshing: true`
- [X] T025 [P] Add `RefreshButton.css` with disabled state styling and smooth transitions
- [X] T026 [P] Write component test for `RefreshButton` in `frontend/tests/unit/RefreshButton.test.tsx` - verify disabled state, onClick handler, loading text

### 3D: PollingIndicator Component (Flamboyant UI)

- [X] T027 Create `frontend/src/components/PollingIndicator.tsx` displaying "✨ LIVE ✨" badge when `isActive: true`, "😴 SNOOZING 😴" when `false`
- [X] T028 [P] Add `PollingIndicator.css` with pulsing animation for LIVE badge (scale 1→1.15, color cycle), gentle fade for SNOOZING badge
- [X] T029 [P] Write component test for `PollingIndicator` in `frontend/tests/unit/PollingIndicator.test.tsx` - verify correct badge displayed per `isActive` state

### 3E: LastUpdated Timestamp Component

- [X] T030 Create `frontend/src/components/LastUpdated.tsx` displaying "Updated {relativeTime}" with `useRelativeTime()` hook
- [X] T031 [P] Add `LastUpdated.css` with muted text styling and clear visibility
- [X] T032 [P] Write component test for `LastUpdated` in `frontend/tests/unit/LastUpdated.test.tsx` - verify timestamp displays and updates every second

### 3F: Update SessionPage Integration (Core Story Implementation)

- [X] T033 Open `frontend/src/pages/SessionPage.tsx`, import `useInactivity`, `useTrophies`, `useRelativeTime`
- [X] T034 [P] Add hook calls: `const isInactive = useInactivity(300000)`, `const { trophies, lastUpdated, isRefreshing, error, refetch } = useTrophies(sessionId, !isInactive)`, `const relativeTime = useRelativeTime(lastUpdated)`
- [X] T035 [P] Add new trophy tracking state: `const [previousTrophyIds, setPreviousTrophyIds] = useState<Set<string>>(new Set())`
- [X] T036 Implement useEffect to detect new trophies: compare `trophies.map(t => t.id)` against `previousTrophyIds`, identify new IDs
- [X] T037 [P] Add conditional rendering for UI elements: `<PollingIndicator isActive={!isInactive} />`
- [X] T038 [P] Add refresh button: `<RefreshButton onClick={refetch} isRefreshing={isRefreshing} />`
- [X] T039 [P] Add timestamp display: `{lastUpdated && <LastUpdated timestamp={lastUpdated} />}`
- [X] T040 [P] Add error message display: `{error && <div className="error-message">⚠️ {error}</div>}`
- [X] T041 Add new trophy highlight class to trophy list items: `className={!previousTrophyIds.has(trophy.id) ? 'new-trophy' : ''}`

### 3G: New Trophy Animation CSS

- [X] T042 Add `.new-trophy` animation to `frontend/src/pages/SessionPage.css`: fade-in (opacity 0→1), scale (0.95→1.05→1), gold background flash (rgba(255,215,0,0.4))
- [X] T043 [P] Add `.error-message` styling: red/orange text, padding, margin, clear visibility
- [X] T044 [P] Add `.last-updated` styling: muted text, small font, right-aligned or near trophy count
- [X] T045 [P] Ensure refresh button disabled state prevents interaction, shows loading indicator

### 3H: Integration Tests for User Story 1

- [X] T046 Run all integration tests: `npm test -- polling.test.ts trophy-api.test.ts` - all tests PASS
- [X] T047 Manual QA: Open session page, verify polling starts (Network tab shows GET /api/sessions/*/trophies every 3s)
- [X] T048 [P] Manual QA: Submit trophy from another tab, verify it appears within 3s with gold highlight animation
- [X] T049 [P] Manual QA: Click "Refresh Trophies" button, verify list updates immediately, loading state shows, timestamp updates
- [X] T050 [P] Manual QA: Wait 5 minutes idle, verify "SNOOZING" badge appears, polling pauses
- [X] T051 [P] Manual QA: Move mouse/click, verify "LIVE" badge returns, polling resumes
- [X] T052 [P] Manual QA: Network error test - simulate offline, verify error message displays, polling continues retrying

**Checkpoint**: User Story 1 fully functional and tested independently. Core polling, refresh, and inactivity features complete. Ready for MVP deployment.

---

## Phase 4: User Story 2 - Access Trophy Presentation Mode (Priority: P2)

**Goal**: Display "Present Trophies" button when 2+ trophies exist, hide when 0-1 trophies, navigate to presentation view on click.

**Independent Test**: Create session with 2+ trophies, view session page, verify "Present Trophies" button appears with theatrical styling; click button, verify navigation to presentation page; delete a trophy until only 1 remains, refresh, verify button disappears.

### 4A: Tests for User Story 2 (Test-First)

- [X] T053 Write component test for "Present Trophies" button visibility in `frontend/tests/unit/SessionPage.test.tsx` - appears when `trophies.length >= 2`
- [X] T054 [P] Write component test - button hidden when `trophies.length === 0`
- [X] T055 [P] Write component test - button hidden when `trophies.length === 1`
- [X] T056 [P] Write component test - button updates dynamically after refresh (e.g., 1→2 trophies triggers show)
- [X] T057 [P] Write component test - onClick navigates to presentation page with correct session ID

### 4B: PresentTrophiesButton Component (Flamboyant UI)

- [X] T058 Create `frontend/src/components/PresentTrophiesButton.tsx` displaying "🎭 PRESENT TROPHIES! 🎭" with onClick handler
- [X] T059 [P] Add `PresentTrophiesButton.css` with gradient background (135deg, #ff006e, #8338ec, #3a86ff), large font, bold text, pulsing shadow animation
- [X] T060 [P] Add hover effects: scale(1.1), rotate(2deg), enhanced glow
- [X] T061 [P] Write component test for `PresentTrophiesButton` in `frontend/tests/unit/PresentTrophiesButton.test.tsx` - verify button style and onClick handler

### 4C: SessionPage Updates for "Present Trophies" Logic

- [X] T062 Add conditional rendering to `frontend/src/pages/SubmissionPage.tsx`: `{trophies.length >= 2 && <PresentTrophiesButton onClick={handlePresentClick} />}`
- [X] T063 [P] Import `PresentTrophiesButton` component and style
- [X] T064 Implement `handlePresentClick()` function that navigates to `PresentationPage` with session ID (use React Router `useNavigate()`)

### 4D: Integration Tests for User Story 2

- [X] T065 Run component tests: `npm test -- SessionPage.test.tsx PresentTrophiesButton.test.tsx` - all tests PASS
- [X] T066 Manual QA: Session with 0 trophies - button hidden
- [X] T067 [P] Manual QA: Session with 1 trophy - button hidden
- [X] T068 [P] Manual QA: Session with 2 trophies - button visible with theatrical styling (gradient, glow, pulsing)
- [X] T069 [P] Manual QA: Session with 3+ trophies - button visible
- [X] T070 [P] Manual QA: Add trophy (manually or via polling) to change count from 1→2 - button appears dynamically with slide-in animation
- [X] T071 [P] Manual QA: Click "🎭 PRESENT TROPHIES! 🎭" button - navigate to presentation page successfully
- [X] T072 [P] Manual QA: Delete trophy on backend, refresh - button disappears if count ≤ 1

**Checkpoint**: User Story 2 complete and tested independently. Both refresh (US1) and presentation (US2) features fully functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Refinement, testing, and documentation completeness

### 5A: Test Coverage & Validation

- [X] T073 [P] Run full frontend test suite: `npm test` - all tests PASS with >80% coverage
- [X] T074 [P] Run backend API tests if added: `dotnet test` - trophy fetch endpoint tests PASS
- [X] T075 [P] Accessibility audit: test with keyboard navigation (Tab, Enter), screen reader (NVDA/JAWS), ensure buttons and indicators accessible

### 5B: Performance & Optimization

- [X] T076 Verify polling doesn't cause layout shift or scroll jump: test with Network throttling (Slow 3G)
- [X] T077 [P] Verify memory cleanup: check DevTools Memory tab, no memory leaks from interval/event listener cleanup
- [X] T078 [P] Check bundle size: polling hooks + components should add <5KB gzipped

### 5C: Cross-Browser Testing

- [X] T079 Test in Chrome (latest) - polling, refresh, inactivity all work
- [X] T080 [P] Test in Firefox (latest) - same functionality
- [X] T081 [P] Test in Safari (latest) - same functionality
- [X] T082 [P] Test on mobile (iOS Safari, Chrome Android) - touch interactions work, polling continues

### 5D: Edge Case & Error Handling

- [X] T083 Test network error scenarios: mock API failure, verify error message displays, polling auto-retries
- [X] T084 [P] Test rapid activity toggling: quickly move mouse back/forth during inactivity window, verify no rapid polling start/stop
- [X] T085 [P] Test manual refresh during automatic polling: click refresh button while polling interval fires, verify no duplicate requests
- [X] T086 [P] Test session deletion: if session deleted while viewing, verify graceful error handling

### 5E: Documentation & Code Quality

- [X] T087 Add JSDoc comments to all hook functions (`useInactivity`, `useRelativeTime`, enhanced `useTrophies`) explaining parameters, return values, side effects
- [X] T088 [P] Add inline comments to polling logic in `SubmissionPage.tsx` explaining inactivity detection, new trophy tracking, state management
- [X] T089 [P] Update `frontend/README.md` with polling feature description and configuration (interval, timeout values)
- [X] T090 [P] Verify code follows Trophy3D style guide: naming conventions, component structure, CSS patterns

### 5F: Final Validation Against Constitution

- [X] T091 Correctness check: All acceptance scenarios from spec.md PASS in manual QA (15 for US1 + 5 for US2)
- [X] T092 [P] Flamboyant UI check: Verify animations are theatrical (pulsing badge, gold flash, gradient button, emojis), align with Trophy3D personality
- [X] T093 [P] Test-First check: All happy path tests written before/during implementation, test coverage complete
- [X] T094 [P] Clarity check: Code readable, functions well-named, complex logic documented
- [X] T095 [P] Simplicity check: No over-engineering, polling straightforward, state management clear

### 5G: Quickstart Validation

- [X] T096 Run quickstart.md Phase 4 validation: execute all manual QA steps from quickstart guide, verify all pass
- [X] T097 Verify quickstart.md file paths are correct and match implementation
- [X] T098 Test that a new developer can follow quickstart.md and verify feature works without external guidance

### 5H: Commit & Cleanup

- [X] T099 Ensure all code is committed to branch `002-trophy-refresh-button`
- [X] T100 Remove any debug console.log statements, commented-out code
- [X] T101 [P] Verify no TypeScript errors: `npm run build` completes successfully
- [X] T102 [P] Verify no linting errors: `npm run lint` passes (ESLint, Prettier)

---

## Summary: Task Counts by Phase & Story

| Phase | Title | Task Count | Notes |
|-------|-------|-----------|-------|
| 1 | Setup | 4 | API verification, config |
| 2 | Foundational | 8 | Hooks + utilities (blocking) |
| 3 | US1 (P1) - Refresh | 50 | Polling, refresh, inactivity, animations, tests |
| 4 | US2 (P2) - Presentation | 20 | Button visibility, navigation |
| 5 | Polish | 30 | Tests, performance, cross-browser, docs |
| | **TOTAL** | **102** | |

**Test Task Count**: 28 (T006-T010, T019-T023, T026, T029, T032, T046, T053-T057, T061, T065-T072, T073-T074, T079-T082, T091-T095, T096)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
  ↓ (depends on)
Phase 2: Foundational (BLOCKING - must complete before user stories)
  ├─ Phase 3: User Story 1 (P1) 🎯 MVP
  └─ Phase 4: User Story 2 (P2)
       ↓
Phase 5: Polish & Cross-Cutting
```

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 2 foundational hooks - can start immediately after Foundation
- **US2 (P2)**: Depends on Phase 2 foundation + can integrate with US1 output but is independently testable

### Within Each Phase

- **Phase 1**: Sequential (small phase, API contract critical)
- **Phase 2**: All [P] tasks can run in parallel (hooks are independent)
- **Phase 3 US1**: 
  - T013-T018: useTrophies hook (sequential, builds state)
  - T019-T023: Tests (can run in parallel, all [P])
  - T024-T032: Components (can run in parallel, all [P] except T024, T027, T030)
  - T033-T045: SessionPage integration (sequential, builds on previous)
  - T046-T052: Integration tests (sequential, test entire story)
- **Phase 4 US2**:
  - T053-T057: Tests (parallel, all [P])
  - T058-T061: Button component (parallel, all [P] except T058)
  - T062-T064: SessionPage updates (sequential)
  - T065-T072: Integration tests (sequential)
- **Phase 5**: Polish tasks largely parallel within groups

---

## Parallel Opportunities

### Quick Parallel Example (Phase 2 Foundational)

```
Developer A: T005-T007 (useInactivity hook + tests)
Developer B: T008-T010 (useRelativeTime hook + tests)
Developer C: T011-T012 (API layer)

All three can work simultaneously, no file conflicts.
When all complete → Phase 3 user story work can begin.
```

### Parallel Example (Phase 3 US1 Components)

```
Developer A: T024-T026 (RefreshButton component)
Developer B: T027-T029 (PollingIndicator component)
Developer C: T030-T032 (LastUpdated component)

All three work in parallel on different component files.
When all components ready → integrate into SessionPage (T033+).
```

### Parallel Example (Phase 4 US2)

```
Developer A: T053-T057 (US2 tests - write first!)
Developer B: T058-T061 (PresentTrophiesButton component)
Developer C: T062-T064 (SessionPage integration logic)

Once A finishes tests, B and C can implement.
All complete in parallel, minimal merge conflicts.
```

---

## Implementation Strategy

### MVP First (Recommended for Incremental Delivery)

```
✅ PHASE 1: Setup → ✅ PHASE 2: Foundation
  ↓
✅ PHASE 3: User Story 1 (P1 - Refresh) → STOP & VALIDATE
  ├─ Deploy: Refresh + polling + inactivity detection
  ├─ User value: Real-time trophy updates, no page reload needed
  └─ Demo: Polling every 3s, manual refresh, inactivity pause
  
✅ PHASE 4: User Story 2 (P2 - Presentation) → STOP & VALIDATE
  ├─ Deploy: "Present Trophies" button with navigation
  ├─ User value: Quick access to presentation mode
  └─ Demo: Button appears with 2+ trophies, navigation works
  
✅ PHASE 5: Polish → PRODUCTION READY
```

### Parallel Team Strategy (3+ Developers)

```
🔄 PHASE 1: Setup (1 dev) + PHASE 2: Foundation (2-3 devs in parallel)

Once Foundation complete:
  Developer A: Phase 3 User Story 1 (Refresh feature)
  Developer B: Phase 4 User Story 2 (Presentation button)
  Developer C: Phase 5 Polish (tests, docs, cross-browser)

Stories complete independently, merge in priority order.
All finish ~same time, ready for release together.
```

---

## Notes for Implementation

### Key Task Sequences

1. **Tests come FIRST**: T019-T023 (US1 tests) and T053-T057 (US2 tests) must be written and FAIL before implementation begins
2. **Foundational hooks block**: US1 cannot start until T005-T012 complete
3. **Component integration last**: Don't integrate components into SessionPage (T033+) until all components built (T024-T032)
4. **Commit frequently**: Commit after each logical group (e.g., after T026, after T040, after T072)

### File Organization Summary

**New Files Created**:
- Hooks: `useInactivity.ts`, `useRelativeTime.ts` (enhanced: `useTrophies.ts`)
- Components: `RefreshButton.tsx`, `PollingIndicator.tsx`, `LastUpdated.tsx`, `PresentTrophiesButton.tsx`
- CSS: Each component gets its own `.css` file
- Tests: Unit tests in `tests/unit/`, integration tests in `tests/integration/`

**Modified Files**:
- `frontend/src/hooks/useTrophies.ts` (add polling logic)
- `frontend/src/pages/SessionPage.tsx` (integrate all hooks and components)
- `frontend/src/pages/SessionPage.css` (add animations)
- `frontend/src/services/api.ts` (add getTrophies function)

---

## Success Criteria Per Phase

- **Phase 1 Complete**: API endpoint verified or created, backend contract matches openapi.yaml
- **Phase 2 Complete**: All hooks tested and working, no memory leaks, 100% of test cases PASS
- **Phase 3 Complete**: US1 all 15 acceptance scenarios PASS, polling works, inactivity pause/resume works, new trophy highlights visible
- **Phase 4 Complete**: US2 all 5 acceptance scenarios PASS, button visibility correct, presentation navigation works
- **Phase 5 Complete**: All tests PASS, cross-browser verified, docs updated, no console errors, bundle size acceptable

---

## Troubleshooting During Implementation

| Issue | Debug Steps |
|-------|------------|
| Polling doesn't start | Verify `pollingEnabled: true` in useTrophies call; check isInactive state |
| Inactivity doesn't trigger | Check timeout value (300000ms = 5 min); add console.log to event listeners |
| New trophy highlights don't show | Verify previousTrophyIds updating; check CSS animation defined; inspect DOM |
| Button doesn't appear at 2+ trophies | Check trophies.length >= 2 condition; verify state updating; React DevTools |
| Memory leak from intervals | Check useEffect cleanup functions return `clearInterval()` |
| API errors not caught | Verify try-catch in fetchTrophies; check error state set; inspect Network tab |

---

## Next Steps After Task Completion

1. ✅ **Code Review**: PR to main with all tasks completed, Constitution check passes
2. ✅ **QA Testing**: Full regression test against spec.md acceptance scenarios
3. ✅ **Demo**: Show polling, refresh, inactivity, presentation button in action
4. ✅ **Merge**: Merge PR to main branch, feature complete
5. ✅ **Deployment**: Deploy to staging → production
6. 📊 **Monitor**: Track polling performance, error rates, user engagement with refresh features
