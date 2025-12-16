# Data Model: Trophy Presentation Improvements (Feature 005)

## Summary

**No data model changes required.** This feature is purely UI/CSS modifications to existing frontend components.

## Existing Models (Reference Only)

### TrophySubmissionResponse (DTO - Unchanged)

```typescript
interface TrophySubmissionResponse {
  id: string
  recipientName: string        // HIDDEN on submission page
  achievementText: string      // HIDDEN on submission page
  submitterName?: string       // SHOWN on submission page
  displayOrder: number         // SHOWN on submission page
  submittedAt: string
}
```

**Used By:**
- `SubmissionPage.tsx` - displays list of trophies
- `PresentationPage.tsx` - displays trophies one at a time

**Changes:** None to the data structure, only to how it's rendered.

## Component Props (Unchanged)

### TrophyPresentation Component

```typescript
interface Trophy {
  id: string
  recipientName: string
  achievementText: string
  submitterName?: string
  displayOrder: number
}

interface TrophyPresentationProps {
  trophy: Trophy
}
```

**Changes:** None to the interface. Only CSS and JSX structure changes.

## CSS Class Structure (New/Modified)

### SubmissionPage.css

```css
/* Modified - now hides details, shows author */
.trophy-item {
  /* existing styles */
}

.trophy-content {
  /* existing styles */
}

/* NEW - placeholder for hidden trophy */
.trophy-placeholder-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.trophy-author {
  font-size: 14px;
  color: #888;
  font-style: italic;
}
```

### TrophyPresentation.css

```css
/* Modified - larger size */
.trophy-presentation {
  max-width: 900px;  /* was 600px */
}

.trophy-visual {
  min-height: 60vh;  /* NEW */
}

.trophy-icon {
  font-size: 200px;  /* was 120px */
}

/* NEW - text section below trophy */
.trophy-text-section {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 24px;
}

/* Modified - larger, darker for contrast */
.recipient-name {
  font-size: 42px;      /* was 28px */
  color: #1a1a1a;       /* was #FFD700 */
}

.achievement-text {
  font-size: 24px;      /* was 16px */
  color: #333333;       /* was #FFFFFF */
}

.giver-info {
  font-size: 18px;      /* was 14px */
  color: #666666;       /* was #E0E0E0 */
}
```

## Data Flow (Unchanged)

```
Backend API
  ↓
GET /api/sessions/{code}/trophies
  ↓
Frontend: useTrophies hook
  ↓
SubmissionPage (hides recipient/achievement, shows author)
PresentationPage → TrophyPresentation (shows all fields)
```

**No API changes. No state management changes.**

## Impact Assessment

| Component | Change Type | Risk |
|-----------|-------------|------|
| Backend | None | None |
| API Contracts | None | None |
| Data Models | None | None |
| SubmissionPage.tsx | Conditional Rendering | Low |
| SubmissionPage.css | New Classes | Low |
| TrophyPresentation.tsx | JSX Structure | Low |
| TrophyPresentation.css | Modified Styles | Low |

**Rollback**: Simple CSS/JSX revert, no data migrations.

---

**Data model analysis complete. No database or API changes required.**
