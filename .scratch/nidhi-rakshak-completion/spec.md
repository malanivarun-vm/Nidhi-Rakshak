## Submission-ready UI and journey completion

### Problem Statement

The prototype has working deterministic diagnosis and resolution logic, but its current UI has duplicate styling, an incomplete diagnosis-to-resolution seam, and visually unfinished documented journeys.

### Solution

Keep the four golden cases fixture-backed and deterministic, unify both features on the shared token/component system, make the case list the front door, route diagnosis into the first real resolution action, and expose the documented golden, family, refusal, evidence, correction-route, receipt, tracking, and pre-flight screens through working interactions.

### Principles

- The fixture-backed demo is intentional. No live EPFO, employer, bank, or database dependency is required for submission behavior.
- Deterministic domain logic owns verdicts, ownership, correction routing, and simulation math. UI only translates and composes those results.
- Answer first, evidence second. Every action screen has one obvious primary action and a safe wait/refusal state where applicable.
- One shared visual foundation serves diagnosis and resolution. Feature code binds to semantic tokens and shared primitives.

### Display and navigation rules

- `/` opens a centered case list. Each of the four golden cases and representative J4-J7/pre-flight entries is reachable without editing the URL.
- Selecting a golden case opens a compact claim entry, then diagnosis. Supported diagnosis ends in `/resolution/<caseId>`; unsupported or evidence-needed cases stay on the safe evidence/refusal path.
- Resolution never repeats the full diagnosis. It starts at the first action: Fight simulation, Fix simulation/correction route, Forward ownership/handoff, or refusal fallback.
- Fight shows an interactive 1-to-2 mismatch simulation before consent. Fix shows a 1-to-0 blocker simulation before correction route and re-check.
- Every consequential outbound action is labelled simulated, gated by explicit consent where applicable, and produces a forwardable receipt or handoff plus tracking.
- The UI supports loading, retryable technical error, intentional uncertainty, empty, partial, disabled, offline-preserved, wait, and three-way re-check outcomes wherever those states apply.
- Layout is mobile-first at 390px, uses 16px gutters, and remains a centered approximately 460px column on desktop without horizontal overflow.

### Verification criteria

- `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm test:e2e` pass.
- Browser walkthrough proves all four golden journeys, J4-J7, pre-flight, consent gating, simulation transitions, shareable artifact actions, retry, resume, and responsive overflow at 375px and 1440px.
- No shipped UI imports the resolution-specific stylesheet or exposes internal verdict/family names to members.

### Existing API and persistence stories

1. As a member, I want claim context to load from the rejected claim so that I do not re-enter rejection details.
2. As a member, I want a rescue case to be created or resumed idempotently so that reopening a claim does not duplicate cases.
3. As a member, I want diagnosis to run through a safe API so that supported, uncertain, and unsupported cases are handled explicitly.
4. As a member, I want to add and review evidence with provenance so that diagnosis remains inspectable.
5. As a member, I want timeline and verdict projections so that the diagnosis is understandable without internal enums.
6. As a member, I want simulations, actions, handoffs, receipts, and re-checks to survive reloads.
7. As a member, I want repeated requests to return the original result instead of creating duplicates.
8. As a member, I want resolved, repeated-blocker, new-blocker, wait, and refusal states to be distinct.
9. As an integration driver, I want B to consume one validated A provider so that UI and resolution logic need no rewrite at I1.
10. As a reviewer, I want browser tests for all four golden journeys and required failure states.
11. As an operator, I want migration, seed, static checks, tests, build, and deployment evidence before ship.

## Implementation Decisions

- Implement the documented A routes with fixture and database-backed modes where the existing domain supports both.
- Use a typed in-process `DiagnosisProvider` adapter for B, with `DiagnosisResult.parse` at the boundary.
- Add durable idempotency keys and persisted resolution/re-check records within B-owned schema boundaries.
- Return persisted artifacts and journey state from tracking so reload can restore the current experience.
- Use Playwright against the running Next app for golden journeys, viewport checks, keyboard/focus checks, and error recovery.
- Preserve the shared error envelope and Zod validation at every route boundary.
- Update blueprint checklists only after executable evidence exists.

## Testing Decisions

- Test public route handlers and provider interfaces with independent literal expectations.
- Use local Postgres integration tests for persistence and duplicate safety where available.
- Use browser tests for complete user journeys instead of relying on unit tests to prove UI behavior.
- Run `pnpm check`, `pnpm test`, `pnpm preflight`, `pnpm db:migrate`, `pnpm build`, and `git diff --check`.

## Out of Scope

- Real EPFO, employer, or bank submissions.
- Authentication, real member data, email, messaging, realtime, payments, and production deployment changes beyond verification.
- New statutory rules, diagnosis logic, or changes to frozen shared contract semantics.

## Further Notes

The implementation follows the approved slices in dependency order: A API, B persistence, resume UI, browser proof, I1 integration, and I3 verification/documentation.
