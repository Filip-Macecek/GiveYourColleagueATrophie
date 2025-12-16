# Quickstart: Trophy Presentation Improvements (Feature 005)

**Time Estimate**: 2-3 hours  
**Difficulty**: Easy  
**Files**: 4 files (2 TSX, 2 CSS)

## Quick Summary

1. Hide trophy details on submission page, show author
2. Make trophy bigger (60vh height, 200px icon)
3. Move text below trophy with white background

## Files to Modify

- `frontend/src/pages/SubmissionPage.tsx`
- `frontend/src/pages/SubmissionPage.css`
- `frontend/src/components/TrophyPresentation.tsx`
- `frontend/src/components/TrophyPresentation.css`

---

## Step 1: Hide Trophy Details (15 min)

### SubmissionPage.tsx (~line 160)

**Find:**
```tsx
<div className="trophy-content">
  <h3>{trophy.recipientName}</h3>
  <p>{trophy.achievementText}</p>
  {trophy.submitterName && <p className="submitter">by {trophy.submitterName}</p>}
</div>
```

**Replace with:**
```tsx
<div className="trophy-content">
  <p className="trophy-placeholder-text">🏆 Trophy #{trophy.displayOrder} submitted</p>
  {trophy.submitterName && <p className="trophy-author">by {trophy.submitterName}</p>}
</div>
```

### SubmissionPage.css (add at end)

```css
.trophy-placeholder-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.trophy-author {
  font-size: 14px;
  color: #888;
  font-style: italic;
  margin: 0;
}
```

---

## Step 2: Enlarge Trophy (30 min)

### TrophyPresentation.css

**Update existing classes:**

```css
.trophy-presentation {
  max-width: 900px;  /* was 600px */
  margin: 0 auto 20px;
}

.trophy-visual {
  min-height: 60vh;  /* NEW */
  aspect-ratio: 1;
  /* ... existing styles ... */
}

.trophy-icon {
  font-size: 200px;  /* was 120px */
  /* ... existing styles ... */
}
```

---

## Step 3: Move Text Below Trophy (45 min)

### TrophyPresentation.tsx

**Find:**
```tsx
<div className="trophy-presentation">
  <div className="trophy-visual">
    <div className="trophy-3d-placeholder">
      <div className="trophy-icon">🏆</div>
    </div>
  </div>
  
  <div className="trophy-overlay">  {/* REMOVE THIS */}
    <h2 className="recipient-name">{receiverName}</h2>
    <p className="achievement-text">{achievementTitle}</p>
    <p className="giver-info">From: {giverName}</p>
  </div>
</div>
```

**Replace with:**
```tsx
<div className="trophy-presentation" ref={ref as any} role="figure" aria-label={...}>
  <div className="trophy-visual">
    <div className="trophy-3d-placeholder">
      <div className="trophy-icon" aria-hidden="true">🏆</div>
    </div>
  </div>
  
  <div className="trophy-text-section">
    <h2 className="recipient-name">{receiverName}</h2>
    <p className="achievement-text">{achievementTitle}</p>
    <p className="giver-info">From: {giverName}</p>
  </div>
</div>
```

### TrophyPresentation.css

**Remove or comment out:**
```css
/* DELETE THIS:
.trophy-overlay {
  position: absolute;
  ...
}
*/
```

**Add new text section:**
```css
.trophy-text-section {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 24px;
  text-align: center;
}
```

**Update text styles:**
```css
.recipient-name {
  font-size: 42px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.2;
  word-wrap: break-word;
}

.achievement-text {
  font-size: 24px;
  line-height: 1.5;
  color: #333333;
  margin: 0 0 16px 0;
  word-wrap: break-word;
}

.giver-info {
  font-size: 18px;
  font-style: italic;
  color: #666666;
  margin: 0;
}
```

---

## Testing Checklist

### Submission Page
- [ ] Trophy #1, #2, etc. visible
- [ ] Recipient names HIDDEN
- [ ] Achievement text HIDDEN
- [ ] Author names ("by Adam") VISIBLE

### Presentation Page
- [ ] Trophy ~60% of screen height (1080p)
- [ ] Trophy icon large (~200px)
- [ ] Text BELOW trophy (not overlaid)
- [ ] White background on text
- [ ] Readable from 2-3 feet away
- [ ] Confetti triggers on entry
- [ ] Spin animation works

### Browser Testing
- [ ] Chrome works
- [ ] Firefox works
- [ ] Safari works

---

## Common Issues

**Issue**: Trophy details still showing on submission page  
**Fix**: Check you modified the correct `<div className="trophy-content">` section

**Issue**: Trophy not 60vh tall  
**Fix**: Verify `.trophy-visual { min-height: 60vh; }` is applied

**Issue**: Text still overlaid on trophy  
**Fix**: Ensure `.trophy-text-section` is a SIBLING of `.trophy-visual`, not a child

**Issue**: Poor text contrast  
**Fix**: Use colors from this guide: #1a1a1a, #333333, #666666 on #ffffff

---

## Build & Run

```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

---

**Total Time**: 2-3 hours | **Complexity**: Easy | **Risk**: Low
