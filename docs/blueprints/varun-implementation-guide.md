# Implementation Guide: Nidhi Rakshak — Claim Intelligence

> **PRD is locked — this is HOW Varun builds Claim Intelligence.** This guide is reference; follow the Session Playbook linearly.

**Status:** Implemented locally; remote provider verification pending
**Mode:** greenfield  
**Pattern source:** greenfield — no prior implementation  
**Authoring inputs:** `docs/PRD.md` · `docs/journeys.md` · `docs/DESIGN.md` · `docs/blueprints/00-shared-integration-contract.md`  
**DRI:** Varun  
**Architecture:** rejected claim → Next.js route handler → validated diagnosis pipeline → Drizzle/Supabase → `DiagnosisResult`  
**Stack:** Next.js 15 · React 19 · TypeScript strict · Drizzle/Postgres/Supabase · Zod · Vitest/Playwright · Biome · Vercel · lucide-react

The shared contract and `docs/DESIGN.md` are mandatory inputs. `docs/DESIGN.md` is the only UI/UX/frontend source of truth; do not create competing tokens or interaction rules.

## Confidence tag legend

- 🟢 confirmed — directly inspected or verified in the repository/product docs
- 🟡 secondary — documented but dependent on external/provider verification
- 🔵 hypothesis — unresolved; cannot remain load-bearing
- 🔴 disproven — checked and rejected

## Part 1 — The Spec

### 1. Summary & Guiding Principle

Claim Intelligence turns a rejected EPFO claim into a concrete, evidence-backed diagnosis: what happened, which record diverged, who owns the blocker, and which safe resolution direction follows. The product uses existing claim context first and refuses when evidence is insufficient. **AI may extract or simplify; deterministic code makes consequential decisions.** 🟢

#### Confirmed scope decisions

| Decision | Resolution | Tag |
|---|---|---|
| Domain boundary | Varun owns rejected context through finalized diagnosis; Harshit consumes the result. | 🟢 |
| P0 families | MISMATCH, MISSING_DATA, VALIDATION_FAILURE, SERVICE_HISTORY, ELIGIBILITY, RECORD_CONSOLIDATION, PENDING_PROCESS, UNSUPPORTED. | 🟢 |
| UI authority | `docs/DESIGN.md` only; mobile-first and all four states required. | 🟢 |
| External EPFO | Simulated claim context; no live reads/writes. | 🟢 |
| Beneficiary succession | Out of scope. | 🟢 |
| Historical member-ID self-service | Safe employer route while unknown. | 🟢 |

### 2. ⭐ The ONE structural decision

```text
Decision: rescue_cases are the aggregate root and each diagnosis is an immutable, versioned DiagnosisResult.
Evidence: PRD/journeys require resume, audit, falsifiability, and re-check; shared schema has rescue_cases, diagnosis_runs.version, and B consumes only DiagnosisResult.
Confidence: 🟢
Blast radius if wrong: every diagnosis API, fixture, table boundary, B integration, and re-check flow.
Alternative considered + rejected: one mutable case result; it loses historical truth and makes re-checks unauditable.
```

### 3. Architecture Overview

```text
EPFO rejected claim context
        │
        ▼
Next.js diagnosis routes ── Zod boundary ── diagnosis pipeline
        │                         │
        │                         ├─ contract registry
        │                         ├─ evidence gate
        │                         ├─ comparison / Mool / timeline
        │                         └─ deterministic owner + verdict
        ▼                         │
Supabase Postgres ◄── Drizzle ────┘
        │
        ▼
validated DiagnosisResult ──► Harshit’s resolution provider
```

Decision log: Supabase/Postgres for relational provenance and history 🟢; Next route handlers to keep a single deployable app 🟢; no auth in simulated P0 🟢; no background jobs 🟢; optional AI extraction is non-consequential and secondary 🟡.

### 4. Data Model & Schema

The frozen schema is `src/db/schema.ts` and migration `drizzle/0000_handy_karnak.sql`. Varun owns `claims`, `claim_rejections`, `rescue_cases`, `rejection_contracts`, `record_snapshots`, `evidence_items`, `diagnosis_runs`, `blockers`, and `timeline_events`. Every diagnosis write is atomic; finalized runs are append-only; child evidence/timeline rows cascade with the case; diagnosis history is restricted from deletion.

Frequent queries require indexes on case/version and case ownership joins. Contract payloads remain JSONB because their shape is a versioned registry, not a frequently filtered relational projection. No user-owned auth policy is active in the simulated prototype; add authz before real member data. 🟢

### 5. API / Net-New Logic Contract

All responses are `{ data }` or `{ error: { code, message, retryable, requestId } }`; all inputs use Zod; state-changing requests require `Idempotency-Key`.

```text
GET  /api/claims/:claimId/rescue-context       auth: none/prototype   C2
POST /api/rescue-cases                         auth: none/prototype   C2
GET  /api/rescue-cases/:caseId                 auth: none/prototype   C2
POST /api/rescue-cases/:caseId/diagnose        auth: none/prototype   C4
GET  /api/rescue-cases/:caseId/diagnosis       auth: none/prototype   C4
POST /api/rescue-cases/:caseId/evidence        auth: none/prototype   C2
GET  /api/rescue-cases/:caseId/evidence        auth: none/prototype   C2
GET  /api/rescue-cases/:caseId/timeline        auth: none/prototype   C3
GET  /api/rescue-cases/:caseId/verdict         auth: none/prototype   C4
```

Net-new rules: map only contract-supported rejection patterns; load only declared records; return `NEEDS_EVIDENCE` when evidence can change the result; define Mool as first observable relevant divergence; determine owner and verdict deterministically; omit verdict for unsupported/uncertain cases; version, never overwrite, on re-check. 🟢

### 6. Backend Changes

Create A-owned modules under the repo-native `src/features/claim-intelligence/**` and `src/app/api/**` namespaces established in A1. Required functions include `decodeRejection`, `assessEvidence`, `compareRelevantRecords`, `deriveMool`, `determineOwner`, `determineVerdict`, `runDiagnosis`, and `persistDiagnosisVersion`. Parameterized Drizzle queries only. Drop: live EPFO integration, identity inference, LLM verdicts, and B-owned resolution writes.

### 7. Frontend Changes

Create A-owned diagnosis screens for S1–S8, S10–S13, S19, and S21: entry, decode, diff, Mool, service timeline, missing detail, rule explanation, Do Not Touch, ownership, evidence, refusal, resume, and correction route. Every screen implements loading, empty, error+retry, data, unsupported where relevant, and back navigation. Use `docs/DESIGN.md` tokens/components and `lucide-react` only. Never expose raw FIGHT/FORWARD/FIX labels as member-facing headings.

### 8. Chunk Map & Boundary Contracts

#### C1 — Contract and route skeleton

Owns no new tables; reads shared contract; exposes typed adapter seams. Acceptance: B imports the exact contract and fixture provider.

#### C2 — Context, registry, evidence

Owns claims/rejections/cases/contracts/evidence; produces decoded context and evidence state. Acceptance: no duplicate member input and safe unsupported branch.

#### C3 — Record intelligence

Owns snapshots/timeline and comparison/Mool derivation; reads C2. Acceptance: provenance is inspectable and Mool never claims blame.

#### C4 — Diagnosis result

Owns diagnosis runs/blockers and verdict/refusal; reads C2/C3; produces `DiagnosisResult` v1. Acceptance: four golden fixtures exactly validate and re-check appends version.

#### C5 — Diagnosis UI

Owns A screens/routes; reads C4 API only. Acceptance: four golden diagnosis spines work at 390px and 1280px with all required states.

### 9. Open Decisions

| Decision | Cheapest test | Owner | Tag |
|---|---|---|---|
| Historical member-ID self-service reach | Portal login inspection; safe employer branch remains default | Product owner | 🔵 non-load-bearing |
| Exact real Supabase project URL | Verify Vercel/Supabase env before DB integration | Integration driver | 🔵 non-load-bearing |
| Numeric statutory thresholds | Do not show until primary verification | Product owner | 🟡 excluded from P0 |

## Part 2 — Technical Reference

### 10. Tech Stack

Use the stack in the header. `lucide-react` is the only icon package. Forbidden: CSS-in-JS, Redux/SWR, npm/yarn, `any`, class components, MUI/Chakra/Mantine, moment/date-fns, competing icon libraries, and production `console.log`.

### 11. File Structure

```text
src/domain/contracts.ts                 shared read-only
src/domain/golden-fixtures.ts           shared read-only
src/features/claim-intelligence/**      Varun owns
src/app/api/claims/**                   Varun owns
src/app/api/diagnosis/**                Varun owns
src/db/schema.ts                        frozen read-only
drizzle/**                              frozen read-only
```

### 12. Environment Variables

Server-only: `DATABASE_URL`, `NODE_ENV`, optional `AI_PROVIDER_API_KEY`. Development: `NIDHI_FIXTURE_MODE`. Public: `NEXT_PUBLIC_ANALYTICS_ENV`. Vercel stores deployment values; Supabase passwords never enter source. Dev/prod databases remain separate.

### 13. System Design & Key Flows

`validate → load → decode → evidence gate → compare → derive → decide → persist → return`. DB writes are transactional. Unsupported and insufficient evidence are domain success states. Retries are bounded; duplicate state-changing requests use idempotency; structured logs contain IDs, codes, duration, and no raw PII.

### 14. Integrations

Supabase Postgres and Vercel only. Optional AI output is schema-validated and may not determine identity, ownership, verdict, or transitions. Analytics uses shared event names. No auth/email/payments/realtime in P0.

### 15. Security Checklist

- [ ] Zod validation at every route boundary.
- [ ] Parameterized queries and server-only database credentials.
- [ ] No real PII in seed/fixtures/logs.
- [ ] Upload type/size and safe storage if S12 upload is implemented.
- [ ] Authz policy added before real member data.

### 16. Performance Targets

Diagnosis API P95 <500ms fixture-mode; page LCP <2.5s; no N+1 record queries. If AI extraction exceeds the budget, show a bounded pending/error state and never guess.

### 17. CI/CD & Deploy Topology

GitHub CI runs install, check, test, build. Vercel serves preview and production. Supabase holds the matching migration. Before I1, verify the project URL/credentials supplied by the owner; never provision or alter production from a feature worktree.

### 18. Known Limitations

Simulated EPFO context, no auth, no live external writes, secondary-source rule verification, and no verified numeric promises. These are explicit P0 boundaries.

## Part 3 — Build Plan to v0

### 19. Pre-Flight

Prepared foundation already includes the schema, contract, fixtures, generator, and app scaffold. Varun runs `pnpm install --frozen-lockfile && pnpm preflight` in his worktree and confirms `docs/DESIGN.md` is the sole frontend authority.

### 20. Sessions

Run `varun-session-playbook.md` in order. Each session has a verbatim Claude Code prompt, exact file boundary, tests, browser smoke test, done-check, and conventional commit.

### 21. Checkpoints

I1: real A response validates as `DiagnosisResult` and can replace the fixture provider. I2: four golden flows replay across diagnosis and resolution. I3: full regression, seed, migration, Vercel/Supabase env parity, and demo.

### 22. Audits

Run resilience audit for validation/idempotency/atomicity/PII and functional-coverage audit for every A screen and every four-state path before merge.

### 23. Launch Prep & Deploy Order

Local green → Supabase dev migration → seed/verify → Vercel preview → I1/I2 → production env parity → Vercel production. No real EPFO action is enabled.

### 24. Week-1 Tracking

Measure supported diagnosis rate, golden verdict agreement, evidence request rate, refusal precision, and repeated rejection. Never optimize refusal down by guessing.

## Gate

- [ ] ⭐ decision is 🟢.
- [ ] No load-bearing 🔵 remains.
- [ ] Every chunk has explicit ownership and boundary contracts.
- [ ] Every endpoint validates input and has a failure path.
- [ ] Contract/golden tests, `pnpm check`, `pnpm test`, and `pnpm build` pass.

## Release verification evidence — 2026-08-28

Candidate `3acd18f4b07227ff71d84b1889c5308c35fd446d` passed explicit fixture fallback: check, 86 unit tests, preflight, build, and 7 local Playwright golden-flow tests. The typed adapter parsed all four current golden cases unchanged. Supabase migration/seed, hosted counts/index inspection, real-provider replay, persistent idempotency, and Vercel Preview parity remain blocked because this session has no `SUPABASE_ACCESS_TOKEN` or `DATABASE_URL`. No Vercel environment changed; the existing GitHub-triggered Production deployment is `READY`. See `varun-final-push.md` for the complete evidence matrix.
