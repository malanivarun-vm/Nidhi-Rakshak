## Problem Statement

The prototype has core diagnosis and resolution code, but documented Claim Intelligence routes, durable idempotency, complete resume behavior, provider integration, browser proof, and final integration evidence are incomplete.

## Solution

Complete the A API lifecycle, harden B persistence around idempotency and history, connect B to A through one validated in-process provider seam, finish the resolution journey states, add browser-level golden-flow and accessibility coverage, and record verified I1-I3 evidence in the blueprint documents.

## User Stories

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
