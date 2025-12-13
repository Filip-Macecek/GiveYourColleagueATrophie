# Trophy3D Constitution

## Core Principles

### I. Correctness Above All
Functional correctness is non-negotiable and foundational. All code MUST:
- Execute correctly for the happy path and documented edge cases
- Be demonstrably correct through automated tests covering the primary workflows
- Produce accurate results; bugs that affect user data or visual output are unacceptable
- Include clear error handling for invalid inputs with informative messages

### II. Flamboyant, Humorous UI/UX
The user interface MUST be delightfully over-the-top and intentionally absurd:
- Visual design should prioritize theatrical excess and playful humor over minimalism
- UI elements, animations, and copy should evoke laughter and delight
- Whimsy and personality are non-negotiable; sterile or corporate aesthetics are forbidden
- Humor must not compromise usability; absurdity enhances the experience but never hides critical information

### III. Test-First Happy Path (MANDATORY)
The happy path MUST be proven and tested before feature completion:
- Write tests for the primary user workflow BEFORE or immediately during implementation
- Happy path tests verify that core functionality works end-to-end in the normal case
- Tests are the specification of correct behavior; they are required deliverables, not optional
- Red-Green-Refactor: Write failing test → implement → test passes → refactor as needed

### IV. Code Clarity & Documentation
Code MUST be readable and self-documenting where possible:
- Function/method names clearly express intent; brevity never sacrifices clarity
- Complex logic includes comments explaining the "why," not just the "what"
- Public APIs have docstrings explaining parameters, return values, and usage examples
- Configuration and constants are named meaningfully, not magic numbers or strings

### V. Simplicity & Restraint in Scope
Projects MUST start simple and avoid unnecessary complexity:
- Feature requests are evaluated against "Is this genuinely needed?" not "Nice to have"
- Over-engineering for hypothetical future scenarios is discouraged (YAGNI principle)
- Dependencies are added deliberately, not by default
- Scope creep is resisted; each feature iteration has clear acceptance criteria

## Quality Gates

All code contributions MUST pass:
- **Correctness**: Primary user workflow tests PASS
- **Code Quality**: No dead code, unclear logic, or poorly named identifiers
- **Documentation**: All public APIs documented; non-obvious logic explained
- **UI Compliance**: If UI feature, verify flamboyance and humor are present

## Development Workflow

1. **Feature Definition**: User story specifies desired behavior and acceptance criteria
2. **Happy Path Test**: Write test(s) covering the primary workflow BEFORE implementation
3. **Implementation**: Code to make happy path tests pass while maintaining clarity
4. **Refinement**: Add error handling, edge case tests, and documentation
5. **Review**: Verify correctness, humor (if UI), clarity, and adherence to principles
6. **Deployment**: Merge to main when all gates pass

## Governance

This constitution supersedes all other practices and conventions. Amendments require:
- Written justification documenting the change and rationale
- Impact assessment on existing features and development workflow
- Explicit version bump and update to this document

All PRs/reviews MUST verify compliance with these principles. Trade-offs are documented in code review comments when principles tension with each other (e.g., performance vs. simplicity).

**Version**: 1.0.0 | **Ratified**: 2025-12-13 | **Last Amended**: 2025-12-13
