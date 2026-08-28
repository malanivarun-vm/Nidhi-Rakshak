# Implementation Guide: Nidhi Rakshak — Resolution & Claim Recovery

> **PRD is locked — this is HOW Harshit builds Resolution & Claim Recovery.** This guide is reference; follow the Session Playbook linearly.

**Status:** Implemented locally; remote provider verification pending
**Mode:** greenfield  
**Pattern source:** greenfield — no prior implementation  
**Authoring inputs:** `docs/PRD.md` · `docs/journeys.md` · `docs/DESIGN.md` · `docs/blueprints/00-shared-integration-contract.md`  
**DRI:** Harshit  
**Architecture:** validated `DiagnosisResult` → Next.js resolution routes → simulation/consent/action state → Drizzle/Supabase → artifact/tracking/re-check  
**Stack:** Next.js 15 · React 19 · TypeScript strict · Drizzle/Postgres/Supabase · Zod · Vitest/Playwright · Biome · Vercel · lucide-react

`docs/DESIGN.md` is the only UI/UX/frontend source of truth. Harshit starts with the fixture provider and must not wait for Varun’s implementation.

## Confidence tag legend

- 🟢 confirmed — directly inspected or verified
- 🟡 secondary — documented but externally dependent
- 🔵 hypothesis — unresolved and non-load-bearing only
- 🔴 disproven — checked and rejected

## Part 1 — The Spec

### 1. Summary & Guiding Principle

Resolution & Claim Recovery turns a finalized diagnosis into one safe next action: correct a member-owned detail, resolve with EPFO, forward a precise request to an employer/bank, wait without duplicate action, or refuse safely. It simulates consequential actions, asks for consent, preserves history, and never promises approval or external submission. **Consume diagnosis; do not diagnose again.** 🟢

#### Confirmed scope decisions

| Decision | Resolution | Tag |
|---|---|---|
| Domain boundary | Harshit owns everything after validated diagnosis. | 🟢 |
| Diagnosis input | Exact shared `DiagnosisResult` v1, initially fixture-backed. | 🟢 |
| UI authority | `docs/DESIGN.md` only; use `lucide-react`. | 🟢 |
| External action | Consent-gated simulation only in P0. | 🟢 |
| Wait/no action | Valid terminal state; do not force a CTA. | 🟢 |
| Live EPFO/employer/bank | Out of scope. | 🟢 |

### 2. ⭐ The ONE structural decision

```text
Decision: every resolution action references an immutable diagnosisId/result snapshot and is append-only; re-check asks A for a new diagnosis version.
Evidence: shared contract separates A-owned diagnosis_runs/blockers from B-owned actions/artifacts and requires versioned re-checks.
Confidence: 🟢
Blast radius if wrong: simulations, consent, handoffs, receipts, tracking, and case closure would lose causal history.
Alternative considered + rejected: let B recompute from rejection code; it duplicates consequential logic and can contradict A.
```

### 3. Architecture Overview

```text
fixture or A DiagnosisResult
          │
          ▼
Next.js resolution routes ── Zod ── translate → simulate → consent
          │                               │
          │                               ├─ proposed change
          │                               ├─ action/handoff/artifact
          │                               └─ tracking/status history
          ▼                               │
Supabase Postgres ◄── Drizzle ────────────┘
          │
          ▼
re-check request ──► A diagnosis contract ──► resolved / same / new blocker
```

Decision log: fixture provider enables parallel work 🟢; Postgres preserves action history 🟢; simulated artifacts avoid false external claims 🟢; no background jobs or realtime 🟢; no auth in P0 🟢.

### 4. Data Model & Schema

Harshit owns `proposed_changes`, `simulations`, `resolution_actions`, `handoffs`, `case_artifacts`, and `case_status_events` in the frozen schema. Every B row references `caseId` and, where consequential, `diagnosisId`. Actions are idempotent by unique key. Artifacts and status events are append-only. Harshit reads A tables/contracts but never writes claims, evidence, diagnosis runs, blockers, or timelines.

### 5. API / Net-New Logic Contract

```text
GET  /api/rescue-cases/:caseId/resolution   auth: none/prototype   B1
POST /api/rescue-cases/:caseId/simulations  auth: none/prototype   B2
POST /api/rescue-cases/:caseId/actions      auth: none/prototype   B3
POST /api/rescue-cases/:caseId/handoffs     auth: none/prototype   B3
POST /api/rescue-cases/:caseId/receipts     auth: none/prototype   B3
GET  /api/rescue-cases/:caseId/tracking     auth: none/prototype   B3
POST /api/rescue-cases/:caseId/recheck      auth: none/prototype   B4
```

All inputs are Zod-validated, responses use the shared envelope, state-changing requests require `Idempotency-Key`, and unsupported/uncertain diagnoses cannot create resolution actions. 🟢

Net-new rules: translate verdict/owner/route fields without renaming or recomputing them; simulation reports blocker delta and disclaimer, never approval; outbound action requires consent; re-check branches resolved/same/new while preserving history. 🟢

### 6. Backend Changes

Create B-owned modules under `src/features/resolution-recovery/**` and `src/app/api/resolution/**` established in B1. Required functions include `translateDiagnosis`, `simulateChange`, `requireConsent`, `createResolutionAction`, `createHandoff`, `createReceipt`, `getTracking`, and `recheckCase`. Drop: diagnosis decoding, comparison, Mool, owner/verdict rules, live outbound delivery, and B writes to A tables.

### 7. Frontend Changes

Create B screens for S9/S11 and S14–S18: resolution summary, Try Before You Touch, Fix/Fight/Forward branches, consent, handoff, receipt, tracking, re-check, resolved, repeated rejection, wait/no action. Start with fixture mode. Every screen has loading, empty, error+retry, data, refusal/wait states and back/resume behavior. `docs/DESIGN.md` controls every visual and interaction choice; use `lucide-react` only.

### 8. Chunk Map & Boundary Contracts

#### C1 — Fixture-backed resolution shell

Owns no new tables; reads validated fixture/provider. Acceptance: Harshit can render all four golden diagnosis results without A implementation.

#### C2 — Translation and simulation

Owns proposed changes/simulations; reads `DiagnosisResult`; acceptance: safe/unsafe delta, no false approval, no verdict recomputation.

#### C3 — Actions and artifacts

Owns actions/handoffs/artifacts/status events; reads diagnosis and simulation contract; acceptance: consent, idempotency, owner-specific artifact, receipt, tracker.

#### C4 — Re-check lifecycle

Owns B state projection; calls A’s documented re-check contract; acceptance: resolved/same/new blocker and history-preserving transitions.

#### C5 — Resolution UI

Owns B screens/routes; reads B APIs and diagnosis contract only. Acceptance: four complete golden resolution loops at 390px and 1280px.

### 9. Open Decisions

| Decision | Cheapest test | Owner | Tag |
|---|---|---|---|
| Receipt renderer | Start with stable HTML/JSON payload; choose image renderer only if demo needs it | Harshit | 🔵 non-load-bearing |
| Supabase project connection | Verify owner-provided Vercel env before live DB test | Integration driver | 🔵 non-load-bearing |
| Real delivery channel | Explicitly excluded from P0 | Product owner | 🟢 out of scope |

## Part 2 — Technical Reference

### 10. Tech Stack

Use the header stack and `lucide-react`. Forbidden: CSS-in-JS, Redux/SWR, npm/yarn, `any`, class components, MUI/Chakra/Mantine, moment/date-fns, competing icon libraries, and production `console.log`.

### 11. File Structure

```text
src/domain/contracts.ts                 shared read-only
src/domain/golden-fixtures.ts           shared read-only
src/domain/fixture-provider.ts          Harshit reads
src/features/resolution-recovery/**     Harshit owns
src/app/api/resolution/**               Harshit owns
src/db/schema.ts                        frozen read-only
drizzle/**                              frozen read-only
```

### 12. Environment Variables

Server-only `DATABASE_URL`, `NODE_ENV`; development `NIDHI_FIXTURE_MODE`; public `NEXT_PUBLIC_ANALYTICS_ENV`. Vercel stores deployment values and Supabase credentials remain server-only. No provider secret in fixtures or client code.

### 13. System Design & Key Flows

`validate diagnosis → translate → simulate → consent → persist action/artifact → track → re-check`. Persist multi-row actions atomically; use idempotency; retry only retryable failures; leave the case intact on artifact failure. A missing/unsupported verdict has no action path.

### 14. Integrations

Supabase Postgres and Vercel only. External EPFO/employer/bank delivery is represented by a clearly simulated artifact. Analytics uses shared event names. No auth/email/payments/realtime in P0.

### 15. Security Checklist

- [ ] Validate diagnosis, proposed changes, consent, and params with Zod.
- [ ] Require explicit consent and idempotency for actions/handoffs.
- [ ] Keep DB credentials server-only; scrub PII from logs/artifacts.
- [ ] Render generated content safely; no raw HTML escape hatch.
- [ ] Add authz before real member data.

### 16. Performance Targets

Resolution read/simulation P95 <500ms fixture-mode; artifact generation <1s; page LCP <2.5s; no N+1 history queries. Keep receipts bounded and deterministic.

### 17. CI/CD & Deploy Topology

GitHub CI runs install, check, test, build. Vercel serves previews/production. Supabase receives the frozen migration before live provider mode. Harshit never applies a schema change from his feature branch.

### 18. Known Limitations

All outbound actions, dates, progress, receipts, and handoffs are simulated. No external channel or real claim approval exists in P0. Re-check is contract-driven and only proves supported blocker state.

## Part 3 — Build Plan to v0

### 19. Pre-Flight

Run `pnpm install --frozen-lockfile && pnpm preflight`; confirm fixture mode and four golden fixtures. Read the shared contract, PRD, journeys, and `docs/DESIGN.md` before starting.

### 20. Sessions

Run `harshit-session-playbook.md` in order. Each session includes exact file ownership, a verbatim Claude Code prompt, tests, browser smoke test, done-check, and conventional commit.

### 21. Checkpoints

I1: A’s real response replaces fixture without UI rewrite. I2: Fight receipt, Forward artifact/tracking, Fix simulation/re-check, and Unsupported refusal work together. I3: full regression/deploy gate.

### 22. Audits

Resilience audit covers consent/idempotency/atomicity/retries/no false claims. Functional audit replays every B screen with four-state behavior, back, reload, wait, refusal, and repeated rejection.

### 23. Launch Prep & Deploy Order

Local fixture green → Supabase dev migration → connect A provider → Vercel preview → golden E2E → env parity → Vercel production. Never represent simulation as live submission.

### 24. Week-1 Tracking

Track resolution starts, simulation completion, handoff/receipt generation, re-check outcomes, blocker resolution, repeated rejection, and errors. External resolution is not counted until a real integration exists.

## Gate

- [ ] ⭐ decision is 🟢.
- [ ] No load-bearing 🔵 remains.
- [ ] Every chunk boundary is explicit and B writes only B tables.
- [ ] Fixture contract tests and all static checks pass.
- [ ] `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Release verification evidence — 2026-08-28

Candidate `3acd18f4b07227ff71d84b1889c5308c35fd446d` passed all local fixture fallback commands: check, 86 unit tests, preflight, build, and 7 committed Playwright golden-flow tests. Supabase migration/seed, persisted action/recheck/idempotency proof, four real-provider replays, and Vercel Preview parity are blocked by unavailable `SUPABASE_ACCESS_TOKEN` and `DATABASE_URL`; no environment was switched to database mode. Existing GitHub Production deployment is `READY` but was not promoted by this release run. See `harshit-final-push.md` for detailed evidence.

**Update:** Supabase CLI authentication/link succeeded and the remote schema is current. The remaining blocker is a non-empty database URL: Vercel’s listed Production `POSTGRES_*` variables export empty here, so the approved seed did not connect or alter data.
