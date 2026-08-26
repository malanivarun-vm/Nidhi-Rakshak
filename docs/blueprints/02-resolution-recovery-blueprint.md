# Builder OS Blueprint 02 — Resolution & Claim Recovery

**Branch:** `feat/resolution-recovery` · **Worktree:** `../Nidhi-Rakshak-resolution-recovery` · **DRI:** Harshit · **Base:** prepared `main` SHA in `03-parallel-build-handoff.md`

## Part 1 — Implementation Guide

### Scope and principle

Build the full-stack domain after diagnosis: translate the validated `DiagnosisResult`, simulate safe actions, route the member, create handoffs/receipts, track status, re-check, and close or reopen a case. **B never recomputes diagnosis or verdict.** Start against `src/domain/fixture-provider.ts`; switch providers only at I1.

### Confirmed decisions and non-goals

🟢 B consumes shared `DiagnosisResult` v1. 🟢 All outbound actions are simulated and consent-gated. 🟢 Waiting/no action is a valid resolution. Out of scope: diagnosis logic, rejection decoding, evidence comparison, live EPFO/employer/bank calls, real messaging, beneficiary succession, and unverified approval predictions.

### Structural risk

Resolution must remain a downstream state machine, not a second diagnosis engine. Every action references `diagnosisId` and a validated result snapshot. If A later publishes a new diagnosis version, B shows the new blocker on re-check and preserves prior action history.

### Files and data ownership

**FILES I OWN:** `src/features/resolution-recovery/**`, `src/app/api/resolution/**`, B-owned repositories/services/tests.

**FILES I MAY READ:** shared contract/types/fixtures/provider, `src/db/schema.ts`, A's diagnosis API contract, all product docs, and `docs/DESIGN.md`.

**FILES I MUST NOT EDIT:** A feature/services/routes/tables, shared contract/schema/migrations, app shell, package/lockfile, global CSS, seed scripts, or analytics bootstrap. B may read A-owned diagnosis rows but writes only B tables.

B writes proposed changes, simulations, resolution actions, handoffs, artifacts/receipts, and case status events. B may update the case status through the agreed transition API but never writes diagnosis/blocker rows.

### Resolution rules and state machine

1. Map `verdict` to user copy: FIX = correct one detail; FIGHT = current details are correct; FORWARD = named counterparty acts; NONE = wait/no action or refusal.
2. `Try Before You Touch` compares before/after and blocker delta. It proves only supported blocker movement, never claim approval.
3. Require explicit consent before simulated outbound handoff/action. The payload is previewable and immutable after consent.
4. Route from `nextRouteType` and owner; do not infer a route from rejection code.
5. Re-check requests A's diagnosis API; result is resolved, same blocker, or new blocker. A new diagnosis version starts a new resolution branch while retaining history.

### APIs

| Endpoint | Contract |
|---|---|
| `GET /api/rescue-cases/:caseId/resolution` | Latest validated diagnosis projection plus resolution state. |
| `POST /api/rescue-cases/:caseId/simulations` | Proposed before/after; returns safe flag, blocker delta, disclaimer. Idempotent. |
| `POST /api/rescue-cases/:caseId/actions` | Consent-gated simulated action with idempotency key; records action event. |
| `POST /api/rescue-cases/:caseId/handoffs` | Generates member/employer/EPFO/bank artifact after consent. |
| `POST /api/rescue-cases/:caseId/receipts` | Creates portable case receipt from diagnosis + action state. |
| `GET /api/rescue-cases/:caseId/tracking` | Owner, blocker, last action, next action, optional clearly simulated date. |
| `POST /api/rescue-cases/:caseId/recheck` | Calls A's diagnosis contract; records resolved/same/new outcome. |

Use `{data}` / shared error envelope, Zod input validation, request IDs, retryable errors, and idempotency. A diagnosis missing a verdict cannot create a Fix/Fight/Forward action; route safely to evidence/refusal.

### Frontend surfaces

Implement S9/S11 translation and S14–S18: resolution summary, simulation, Fix/Fight/Forward, consent, handoff, receipt, tracking, re-check, resolved, repeated rejection, wait/no action. Use fixture IDs immediately. The frontend must visibly label the simulated prototype and keep the product information hierarchy.

**Frontend source of truth:** `docs/DESIGN.md` is the only UI/UX/frontend authority. It controls tokens, typography, responsive behavior, language, components, states, and interaction hierarchy. Do not create alternate styling or UX rules in this blueprint or code.

### Reliability/security/tests

Actions are append-only, idempotent, consented, and simulated. A failed artifact generation leaves the case intact and retryable. Never log payload PII; demo identifiers are synthetic. Unit-test translation, simulation safety, state transitions and consent. Integration-test B table writes and APIs. Contract-test fixture and real-provider swap. E2E Fight receipt, Forward handoff/tracking, Fix simulation/re-check, Unsupported no-action.

### Limitations/open decisions

No real share/email/message integration. Receipt may be an HTML/JSON artifact until the implementation selects a renderer; keep its content contract stable. Date estimates are simulated and labelled. B cannot claim EPFO submission or approval.

## Part 2 — Session Playbook

Every session is one coherent commit. Read this blueprint, shared contract, PRD/journeys, and `docs/DESIGN.md`. `pnpm check && pnpm test` is required at every done-check.

### B1 — Fixture-backed resolution shell

- **Files allowed:** B feature folders, B tests, fixture provider read-only.
- **Depends on:** prepared base and shared `DiagnosisResult`, not A implementation.
- **Steps:** add resolution module boundaries, fixture selector, route skeletons, and state model.
- **Acceptance:** B renders all four fixture states without A code; no verdict derivation.
- **Commit:** `feat: scaffold resolution recovery domain`.

### B2 — Translation, simulation, and route selection

- **Files allowed:** B translation/simulation/route services/tests.
- **Depends on:** B1.
- **Steps:** translate validated result; implement before/after blocker delta, safety disclaimer, Fix/Fight/Forward/None route selection from contract fields.
- **Tests:** all golden fixtures, missing verdict refusal, unsafe proposed change, duplicate simulation.
- **Acceptance:** simulation never says “approved”; internal enum never becomes unexplained primary copy.
- **Commit:** `feat: add resolution translation and simulation`.

### B3 — Actions, handoffs, receipt, tracking persistence

- **Files allowed:** B services/routes/tests.
- **Depends on:** B2.
- **Steps:** consent preview, idempotent simulated action, owner-specific artifacts, receipt payload, status event history, tracking projection.
- **Tests:** consent required, duplicate action, artifact retry, wait/no-action, owner routes.
- **Acceptance:** only B tables mutate; every action has audit event and failure path.
- **Commit:** `feat: add recovery actions and case artifacts`.

### B4 — Re-check and repeated rejection

- **Files allowed:** B re-check services/UI/tests.
- **Depends on:** B3 and shared diagnosis contract; A4 implementation is not required.
- **Steps:** create provider interface, use fixture sequences for resolved/same/new blocker, render case closure or new diagnosis handoff.
- **Tests:** resolved, same blocker, new blocker, reload/resume.
- **Acceptance:** B calls A's contract instead of computing a blocker; history stays intact.
- **Commit:** `feat: add recovery recheck state machine`.

### B5 — Resolution UI and integration adapter

- **Files allowed:** B UI/routes/tests; `docs/DESIGN.md` only source of truth.
- **Depends on:** B4.
- **Steps:** build mobile-first screens for four golden loops, all loading/error/empty/data states, and provider switch seam.
- **Manual:** 390px replay with fixture mode, simulated labels, receipt/handoff/tracker.
- **Acceptance:** real A provider can replace fixture at I1 without UI rewrite.
- **Commit:** `feat: build claim recovery experience`.

### B6 — B verification gate

- **Depends on:** B5.
- **Commands:** `pnpm check && pnpm test && pnpm build`.
- **Acceptance:** ready for I1; no shared-file drift; no live action claims.
- **Commit:** `test: verify resolution recovery golden flows`.

## Builder OS Part 2 — Technical Reference

### 10. Tech Stack

Next.js 15 App Router, React 19, strict TypeScript, Next route handlers, Drizzle ORM/Postgres on Supabase, Zod, Vitest, Playwright, Biome, pnpm, `lucide-react` for icons, deployed on Vercel. B starts fixture-first. Forbidden: CSS-in-JS, Redux/SWR, npm/yarn, `any`, class components, MUI/Chakra/Mantine, moment/date-fns, barrel imports, competing icon libraries, and production `console.log`.

### 11. File Structure

Create only B-owned modules under the repo-native `resolution-recovery` feature/API paths selected in B1. Shared contract/schema, A diagnosis code, and root UI are read-only. Keep simulation, action, artifact, tracking, re-check, screens, and tests isolated.

### 12. Environment Variables

Server-only: `DATABASE_URL`, `NODE_ENV`. Public: `NEXT_PUBLIC_ANALYTICS_ENV`. `NIDHI_FIXTURE_MODE` selects the fixture provider during independent development. Vercel stores values; Supabase credentials never enter source.

### 13. System Design & Key Flows

Use `validate diagnosis → translate → simulate → consent → persist action/artifact → track → re-check`. B never decodes rejection or derives owner/verdict. Actions and artifacts are append-only/idempotent; re-check calls A's contract and branches resolved/same/new. A failed artifact or provider call leaves a retryable state and never claims submission.

### 14. Integrations

Supabase Postgres and Vercel only. External employer/EPFO/bank delivery is represented by a consented simulated artifact. Analytics uses shared snake_case events. No auth, email, messaging, realtime, or payments in P0.

### 15. Security Checklist

- [ ] Validate every route input and proposed change with Zod.
- [ ] Require `Idempotency-Key` and explicit consent for state-changing or outbound-simulated actions.
- [ ] Never expose service credentials or log evidence payloads.
- [ ] Enforce case ownership when auth exists; keep prototype data synthetic.
- [ ] Render artifact text safely; no raw user/model HTML.

### 16. Performance Targets

Resolution reads and simulation P95 < 500ms in fixture mode; receipt/handoff generation < 1s; initial page LCP < 2.5s. Use one bounded query per view and no N+1 history loading.

### 17. CI/CD & Deploy Topology

GitHub CI runs install, check, test, and build. Vercel deploys `main`; feature branches are previews only when requested. Supabase dev and production projects remain separate. Apply the frozen migration before connecting live provider data.

### 18. Known Limitations

No live submission, share, email, or external status polling; all dates/progress are labelled simulated. Receipt rendering may begin as a stable HTML/JSON artifact. Unsupported diagnosis has no resolution action.

## Builder OS Part 3 — Build Plan to v0

### 19. Pre-Flight

- [ ] Start from the prepared SHA and run `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm preflight`; select fixture mode and verify golden IDs.
- [ ] Read PRD, journeys, shared contract, and `docs/DESIGN.md`; do not create a competing frontend spec.

### 20. Sessions

The ordered B1–B6 playbook above is the chunk map. Each session includes this agent prompt: **“Read Blueprint §§1–9 and the shared contract; implement only this session’s files; use the fixture-backed `DiagnosisResult`; obey `docs/DESIGN.md` as the sole frontend source; run the listed commands; do not recompute diagnosis or invent schema/API boundaries; stop if a shared change is required.”**

### 21. Checkpoints

- **I1:** Swap the fixture provider for A's validated response without UI rewrite.
- **I2:** Fight receipt, Forward handoff/tracking, Fix simulation/re-check, and Unsupported refusal replay end-to-end.

### 22. Audits

Resilience audit: consent, idempotency, atomic writes, safe retries, no false approval/submission claims, and no PII logs. Functional audit: every B screen covers loading, empty, error/retry, data, refusal/wait, back, reload/resume.

### 23. Deploy Order

Local fixture checks → Supabase migration/schema verification → connect A provider at I1 → Vercel preview → golden E2E → Vercel production via `main`.

### 24. Week-1 Tracking

Track resolution start, simulation completion, handoff/receipt creation, re-check outcome, blocker resolution, repeated rejection, and error rate. Do not treat outbound simulation as a successful external resolution.

## Gate

- [ ] ⭐ decision is green and no load-bearing 🔵 remains.
- [ ] Every B chunk has owner/boundary/acceptance criteria.
- [ ] Fixture and real-provider contract tests pass.
- [ ] `pnpm check`, `pnpm test`, `pnpm build` pass.
