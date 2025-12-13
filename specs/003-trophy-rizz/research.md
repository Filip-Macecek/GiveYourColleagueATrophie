# Research: Trophy Rizz Presentation

## Decisions

- **Confetti Library**: Use `canvas-confetti`.
  - **Rationale**: Lightweight, widely used, works across browsers with simple API; meets FR-014 and performance needs.
  - **Alternatives considered**: `react-confetti` (fullscreen overlay, heavier), `party-js` (heavier visuals), custom canvas (more work, less consistency).

- **Viewport Detection**: Use IntersectionObserver.
  - **Rationale**: Native, efficient detection when the trophy enters viewport; allows single-trigger and throttling.
  - **Alternatives**: Scroll listeners (less efficient), manual checks (fragile).

  - **Mobile behavior**: IntersectionObserver is supported on modern mobile browsers; ensure rootMargin for early trigger and test Safari iOS quirks. Decision: use `rootMargin: '0px'` and visibility threshold `0.5`.

- **2D Trophy Implementation**: CSS + SVG image with spin animation.
  - **Rationale**: Simple, performant, easy to style and overlay text; respects reduced-motion via CSS media queries.
  - **Alternatives**: Canvas-drawn trophy (more effort), WebGL/3D (out of scope).

- **Text Layout for Names/Achievement**: Positioned overlay with responsive wrapping.
  - **Rationale**: Ensures readability, avoids overlap; clamp to 60 chars with tooltip for overflow as needed.
  - **Alternatives**: Non-overlay separate panel (less cohesive visual), fixed-size text (risk overlap).

- **Next Trophy Navigation**: Use existing session hooks/services (`useSession`, `useTrophies`).
  - **Rationale**: Aligns with current architecture; enables index advance and loading states.
  - **Alternatives**: New state store (overkill), backend pagination changes (not required).

- **Accessibility**: Respect `prefers-reduced-motion`; ensure aria labels for names and roles.
  - **Rationale**: Meets FR-012 and user preferences.
  - **Semantics**: Use `role="figure"` with `aria-label` summarizing receiver, achievement, and giver; text nodes remain readable by screen readers.

## Clarifications Resolved

- **Confetti retriggering control**: Track last trigger timestamp per trophy; suppress retrigger within 30s unless new trophy.
- **Performance limits**: Confetti burst duration <= 2s, particle count modest (e.g., 80-120) and requestAnimationFrame scheduling.
- **Defaults**: If names missing: receiver "Recipient", achievement "Achievement", giver "Anonymous".
- **Loading indicator**: Subtle spinner or shimmer displayed during next trophy fetch.

- **Intersection threshold**: Trigger when 50% of trophy enters viewport; avoids accidental triggers on partial visibility.

## Implementation Notes

- Import `canvas-confetti` dynamically to avoid SSR/initial bundle issues: `import confetti from 'canvas-confetti'`.
- Use component-level `hasConfettiFired` state keyed by `trophyId`.
- Media query for reduced motion disables spin and confetti.
