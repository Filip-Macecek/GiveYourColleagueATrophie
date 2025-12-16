# Tasks: Trophy Presentation Improvements

**Feature**: 005-trophy-presentation-improvements  
**Estimated Effort**: 2-3 hours  
**Total Tasks**: 28

---

## Task Format

- `[P]` = Parallelizable (can run concurrently with other [P] tasks)
- `[US#]` = User Story number from spec.md
- File paths are relative to repository root

---

## Phase 1: Setup & Preparation

**Goal**: Verify environment and create feature branch

- [X] T001 Verify current branch is 005-trophy-presentation-improvements
- [X] T002 [P] Verify frontend development server can run: `cd frontend && npm run dev`
- [X] T003 [P] Open spec.md and review all 3 user stories and acceptance criteria

---

## Phase 2: User Story 1 - Hide Trophy Details on Submission Page (P0)

**Goal**: Hide recipient names and achievement text while showing author names on the submission page

**Independent Test**: Submit trophies and verify only display order and author ("by Adam") are visible, recipient/achievement are hidden

### Implementation

- [X] T004 [US1] Open `frontend/src/pages/SubmissionPage.tsx` for editing
- [X] T005 [US1] Locate trophy list rendering section around line 160 within `.trophy-items` div
- [X] T006 [US1] Modify trophy item content to hide `trophy.recipientName` by removing `<h3>{trophy.recipientName}</h3>`
- [X] T007 [US1] Hide `trophy.achievementText` by removing `<p>{trophy.achievementText}</p>`
- [X] T008 [US1] Keep submitter name visible: ensure `{trophy.submitterName && <p className="trophy-author">by {trophy.submitterName}</p>}` is present
- [X] T009 [US1] Add placeholder text before submitter: `<p className="trophy-placeholder-text">🏆 Trophy #{trophy.displayOrder} submitted</p>`
- [X] T010 [P] [US1] Save SubmissionPage.tsx and verify no TypeScript errors in editor

### Styling

- [X] T011 [US1] Open `frontend/src/pages/SubmissionPage.css` for editing
- [X] T012 [P] [US1] Add `.trophy-placeholder-text` class with font-size: 16px, color: #666, font-weight: 500, margin: 0 0 4px 0
- [X] T013 [P] [US1] Add `.trophy-author` class with font-size: 14px, color: #888, font-style: italic, margin: 0
- [X] T014 [P] [US1] Save SubmissionPage.css and verify CSS compiles without errors

### Testing

- [ ] T015 [US1] Start dev server, navigate to submission page with existing session
- [ ] T016 [US1] Submit 2-3 test trophies with different names and achievements
- [ ] T017 [US1] Verify trophy display order numbers are visible (Trophy #1, #2, etc.)
- [ ] T018 [US1] Verify recipient names are NOT visible in trophy list
- [ ] T019 [US1] Verify achievement text is NOT visible in trophy list
- [ ] T020 [US1] Verify submitter names ARE visible ("by Adam", "by Jane", etc.)
- [ ] T021 [US1] Verify "Present Trophies" button still appears when 2+ trophies exist

---

## Phase 3: User Story 2 - Enlarged Trophy Display (P0)

**Goal**: Make trophy occupy 60-70% of viewport height on desktop 1080p displays

**Independent Test**: Open presentation page on 1920x1080 display and verify trophy is significantly larger, approximately 60-70% of screen height

### CSS Changes

- [X] T022 [US2] Open `frontend/src/components/TrophyPresentation.css` for editing
- [X] T023 [US2] Modify `.trophy-presentation` max-width from 600px to 900px
- [X] T024 [US2] Add to `.trophy-visual`: `min-height: 60vh;` to make trophy larger
- [X] T025 [P] [US2] Modify `.trophy-icon` font-size from 120px to 200px
- [X] T026 [P] [US2] Adjust `.trophy-presentation` margin to reduce bottom whitespace: `margin: 0 auto 20px;`
- [X] T027 [P] [US2] Save TrophyPresentation.css and verify CSS compiles

### Testing

- [ ] T028 [US2] Navigate to presentation page with test trophies
- [ ] T029 [US2] Open browser DevTools, verify viewport is 1920x1080 or similar desktop size
- [ ] T030 [US2] Measure `.trophy-visual` height in DevTools - should be approximately 60-70% of viewport height (~650-750px on 1080p)
- [ ] T031 [US2] Verify trophy icon appears significantly larger (approximately 200px)
- [ ] T032 [US2] Verify trophy remains horizontally centered
- [ ] T033 [US2] Verify spin animation (8 second rotation) still works smoothly
- [ ] T034 [US2] Verify confetti effect triggers when trophy enters viewport

---

## Phase 4: User Story 3 - Improved Text Placement and Readability (P0)

**Goal**: Move trophy text below the visual with white background panel for high contrast

**Independent Test**: Verify text appears below trophy (not overlaid), has white background, and uses large font sizes (42px, 24px, 18px)

### Component Restructuring

- [X] T035 [US3] Open `frontend/src/components/TrophyPresentation.tsx` for editing
- [X] T036 [US3] Locate the `.trophy-overlay` div (around line 50-60)
- [X] T037 [US3] Move the content (recipient name, achievement, giver) outside of `.trophy-visual` to be a sibling div
- [X] T038 [US3] Rename `.trophy-overlay` to `.trophy-text-section` in the JSX
- [X] T039 [US3] Ensure final structure is: `.trophy-presentation` contains `.trophy-visual` (with trophy icon) AND `.trophy-text-section` (with all text) as siblings
- [X] T040 [P] [US3] Save TrophyPresentation.tsx and verify no TypeScript errors

### CSS Styling - Text Section

- [X] T041 [US3] In `frontend/src/components/TrophyPresentation.css`, remove or comment out `.trophy-overlay` absolute positioning styles
- [X] T042 [US3] Create new `.trophy-text-section` class with: background: #ffffff, padding: 32px, border-radius: 12px, box-shadow: 0 4px 12px rgba(0,0,0,0.15), margin-top: 24px, text-align: center
- [X] T043 [P] [US3] Update `.recipient-name`: font-size: 42px, font-weight: 700, color: #1a1a1a, line-height: 1.2, word-wrap: break-word
- [X] T044 [P] [US3] Update `.achievement-text`: font-size: 24px, line-height: 1.5, color: #333333, word-wrap: break-word
- [X] T045 [P] [US3] Update `.giver-info`: font-size: 18px, font-style: italic, color: #666666
- [X] T046 [P] [US3] Save TrophyPresentation.css and verify CSS compiles

### Testing

- [ ] T047 [US3] Refresh presentation page
- [ ] T048 [US3] Verify text section appears BELOW the trophy visual (not overlaid on top)
- [ ] T049 [US3] Verify text section has white background with rounded corners and shadow
- [ ] T050 [US3] Inspect `.recipient-name` in DevTools - verify font-size is 42px, color is #1a1a1a
- [ ] T051 [US3] Inspect `.achievement-text` - verify font-size is 24px, color is #333333
- [ ] T052 [US3] Inspect `.giver-info` - verify font-size is 18px, italic, color is #666666
- [ ] T053 [US3] Verify text is readable from 2-3 feet away on a 24" monitor (qualitative)
- [ ] T054 [US3] Test with long recipient name (40+ characters) - verify text wraps cleanly without overflow
- [ ] T055 [US3] Test with long achievement text (100+ characters) - verify text wraps cleanly
- [ ] T056 [US3] Use browser accessibility tools or Color Contrast Analyzer to verify WCAG AA contrast ratios

---

## Phase 5: Integration Testing

**Goal**: Verify all three user stories work together seamlessly

### End-to-End Testing

- [ ] T057 Create a new session from home page
- [ ] T058 Navigate to submission page, submit 3 test trophies with varied content
- [ ] T059 Verify submission page shows: Trophy #1, #2, #3 with author names; recipient/achievement hidden
- [ ] T060 Click "Present Trophies" button
- [ ] T061 Verify presentation page displays: large trophy (~60vh), text below trophy, white background
- [ ] T062 Verify confetti triggers on trophy entry
- [ ] T063 Click "Next Trophy" and verify second trophy displays with same layout
- [ ] T064 Navigate through all trophies, verify consistency

### Cross-Browser Testing

- [ ] T065 Test full flow in Chrome on desktop 1080p
- [ ] T066 Test full flow in Firefox on desktop 1080p
- [ ] T067 Test full flow in Safari on desktop (macOS)

### Accessibility Testing

- [ ] T068 Run Lighthouse audit on presentation page, verify no accessibility regressions
- [ ] T069 Use screen reader (NVDA or VoiceOver) to navigate presentation page, verify text is announced correctly
- [ ] T070 Verify "Next Trophy" button is keyboard-accessible (Tab, Enter)

---

## Phase 6: Code Review & Cleanup

**Goal**: Ensure code quality before deployment

- [ ] T071 Review all modified files for code clarity and proper formatting
- [ ] T072 Remove any commented-out code or unused styles
- [ ] T073 Run `npm run build` in frontend/ to verify production build succeeds
- [ ] T074 Fix any build warnings or errors
- [ ] T075 Commit changes with clear message: "feat: improve trophy presentation (005)"
- [ ] T076 Push feature branch to remote

---

## Phase 7: Deployment

**Goal**: Deploy to production and verify

- [ ] T077 Merge feature branch 005-trophy-presentation-improvements to main
- [ ] T078 Build production frontend: `cd frontend && npm run build`
- [ ] T079 Deploy frontend to hosting environment
- [ ] T080 Verify deployment completes without errors
- [ ] T081 Test one full user flow in production (submit trophies → present)
- [ ] T082 Monitor for any errors or user feedback in first 24 hours

---

## Task Summary

| Phase | Tasks | User Story | Time Estimate |
|-------|-------|------------|---------------|
| Phase 1: Setup | T001-T003 | - | 5 min |
| Phase 2: US1 - Hide Details | T004-T021 | US1 | 30 min |
| Phase 3: US2 - Enlarge Trophy | T022-T034 | US2 | 45 min |
| Phase 4: US3 - Text Below | T035-T056 | US3 | 60 min |
| Phase 5: Integration Testing | T057-T070 | All | 30 min |
| Phase 6: Code Review | T071-T076 | - | 15 min |
| Phase 7: Deployment | T077-T082 | - | 15 min |
| **Total** | **82 tasks** | | **2h 20m - 3h** |

---

## Dependencies & Execution Order

### Sequential Dependencies

1. Phase 1 → Phase 2, 3, 4 (setup must complete first)
2. Phase 2, 3, 4 → Phase 5 (all user stories must complete before integration testing)
3. Phase 5 → Phase 6 → Phase 7 (testing → review → deployment)

### Parallel Opportunities

- User Story 1, 2, 3 can be implemented in parallel (different files)
- Within each user story, tasks marked `[P]` can run concurrently

### Recommended Workflow

**For solo developer**: Complete Phase 2 → 3 → 4 sequentially for easier debugging

**For team**: Assign US1, US2, US3 to different developers in parallel

---

## Acceptance Criteria Verification

- ✅ **FR-001**: Trophy recipient names and achievement text hidden on submission page
- ✅ **FR-002**: Trophy display order and submitter name shown on submission page
- ✅ **FR-006**: Trophy occupies 60%+ viewport height on desktop 1080p
- ✅ **FR-007**: Trophy icon is 200px
- ✅ **FR-010**: Text positioned below trophy visual
- ✅ **FR-011**: White background panel for text section
- ✅ **FR-013-015**: Font sizes are 42px, 24px, 18px
- ✅ **FR-020**: Confetti animation preserved
- ✅ **FR-021**: Spin animation preserved

---

**Generated**: December 16, 2025  
**Status**: Ready for implementation  
**Next Step**: Begin Phase 1 - Setup
