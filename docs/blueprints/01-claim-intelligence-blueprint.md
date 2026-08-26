# Builder OS Blueprint 01 — Claim Intelligence

**Branch:** `feat/claim-intelligence` · **Worktree:** `../Nidhi-Rakshak-claim-intelligence` · **DRI:** Varun · **Base:** prepared `main` SHA in `03-parallel-build-handoff.md`

## Part 1 — Implementation Guide

### Scope and principle

Build the bounded full-stack domain from rejected claim context through an evidence-backed diagnosis. A owns decoding, family routing, evidence, comparisons, Mool, ownership, deterministic verdict, refusal, and diagnosis UI. **AI may extract; deterministic code decides.** The member-facing sequence is what happened → what not to touch → what to do → who acts → why → how to check.

### Confirmed decisions and non-goals

🟢 Greenfield Next.js/React/TypeScript/Drizzle/Zod/Vitest repo. 🟢 P0 families are the eight enums in the shared contract. 🟢 `DiagnosisResult` v1 is the only output B consumes. Out of scope: resolution mutation, simulation, handoffs, receipts, tracking, beneficiary succession, live EPFO, real PII, and unverified statutory numbers.

### Structural risk

The load-bearing decision is the immutable, versioned diagnosis boundary rooted at `rescue_cases`. Every diagnosis write creates a `diagnosis_runs` version; B reads finalized results and never recomputes verdicts. A wrong boundary would rewrite both domains, so contract tests are a gate before feature work.

### Files and data ownership

**FILES I OWN:** `src/features/claim-intelligence/**`, `src/app/api/claims/**`, `src/app/api/diagnosis/**`, A-owned repositories/services/tests, and A-owned migration-free schema consumers.

**FILES I MAY READ:** `src/domain/contracts.ts`, `src/domain/golden-fixtures.ts`, `src/domain/fixture-provider.ts`, `src/db/schema.ts`, `docs/PRD.md`, `docs/journeys.md`, `docs/DESIGN.md`, shared contract, and B's contracts.

**FILES I MUST NOT EDIT:** `src/features/resolution-recovery/**`, resolution routes/services/tables, `app/layout.tsx`, package/lockfile, global CSS, shared contracts, schema/migrations, seed infrastructure, and analytics bootstrap. Shared changes follow the protocol in `00-shared-integration-contract.md`.

A writes: claims, claim rejections, rescue cases, rejection contracts, record snapshots, evidence items, diagnosis runs, blockers, timeline events. A may read B tables for display only after integration; A never writes them.

### Architecture and rules

1. Load context from a simulated rejected claim; never ask for claim ID or rejection text again.
2. Decode by the rejection-contract registry. Unknown mapping is `UNSUPPORTED`, not a guessed family.
3. Load only contract-declared records. An evidence gate returns `NEEDS_EVIDENCE` when missing/contradictory evidence can change the result.
4. Mool is the first observable relevant divergence; it never names a culprit without a write event.
5. Ownership and verdict are deterministic rules. `FORK` is not an enum/output; produce a concrete verdict or refusal.
6. A finalized result must validate against `DiagnosisResult`. Do Not Touch is explicit whenever changing a currently supported value can worsen mismatch risk.
7. Re-check reads current evidence and appends a new diagnosis version; it does not overwrite prior history.

### Rejection contracts

Implement the v2 fields from PRD §8.3: code, category, patterns, member reason, relevant records, Mool signal, verdict condition, default owner, route eligibility, member/counterparty action, evidence, falsifier, support, verification status, and UI modules. Keep contract config auditable and deterministic. Use `DECLARED_UNSUPPORTED` for taxonomy codes not supported in P0; never render that status as a diagnosis.

### API contracts

| Endpoint | Contract |
|---|---|
| `GET /api/claims/:claimId/rescue-context` | Existing claim/rejection context plus supported contract metadata; no member re-entry. |
| `POST /api/rescue-cases` | Creates/resumes case; idempotent by claim/rejection pair. |
| `GET /api/rescue-cases/:caseId` | Case state and current diagnosis summary. |
| `POST /api/rescue-cases/:caseId/diagnose` | Runs deterministic pipeline; returns validated `DiagnosisResult`. Idempotency key required. |
| `GET /api/rescue-cases/:caseId/diagnosis` | Latest and version history; B uses latest finalized result. |
| `POST/GET /api/rescue-cases/:caseId/evidence` | Add/list evidence; validate metadata and provenance; never silently replace. |
| `GET /api/rescue-cases/:caseId/timeline` | Ordered sourced timeline for service-history journeys. |
| `GET /api/rescue-cases/:caseId/verdict` | Read-only projection of latest result; no second verdict engine. |

Every route returns `{data}` or the shared error envelope, validates input with Zod, records request ID, and has loading/error/empty/data behavior. Unsupported and insufficient evidence are successful domain states, not HTTP errors.

### Frontend surfaces

Implement S1/S2/S3/S4/S5/S6/S7/S8/S10/S11/S12/S13/S19/S21 only as diagnosis features: entry, decode, diff, Mool, timeline, missing detail, rule explanation, Do Not Touch, ownership, verdict/next action, evidence request, refusal, resume, correction-route inputs. Resolution screens belong to B.

**Frontend source of truth:** `docs/DESIGN.md` is the only UI/UX and frontend source of truth. Reuse its tokens, hierarchy, responsive rules, copy principles, component guidance, and four-state behavior. Do not add a competing design file or token system. Internal enums/codes never appear as unexplained member copy.

### State and reliability

Case: `OPEN → DIAGNOSING → DIAGNOSED | REFUSED`; evidence request loops to `DIAGNOSING`; re-check appends a diagnosis. All network calls retry only when the envelope marks them retryable. Duplicate diagnosis/evidence requests are idempotent. Malformed extraction becomes `UNKNOWN` and routes to evidence/refusal. Logs contain IDs and codes, not raw PII.

### Tests and acceptance

Unit-test decoder, router, evidence sufficiency, Mool, ownership, verdict conditions, refusal, and versioning. Integration-test diagnosis persistence and APIs. Contract-test every response against `DiagnosisResult`. E2E golden Fight, Forward diagnosis, Fix diagnosis, and Unsupported. Acceptance requires no verdict without sufficient evidence, no fabricated Mool, exact golden outputs, retryable failures, and all four UI states.

### Limitations/open decisions

EPFO rule values remain secondary-source verified; do not put unverified thresholds on screen. Historical member-ID self-service remains `UNKNOWN` and must use the safe employer branch. Live auth/storage/EPFO are not part of the prototype.

## Part 2 — Session Playbook

Every session is one coherent commit. Read this blueprint, the shared contract, PRD/journeys, and `docs/DESIGN.md` before coding. Run `pnpm check && pnpm test` at every done-check.

### A1 — Diagnose the contract boundary

- **Files allowed:** A feature folders, A tests; shared files read-only.
- **Depends on:** prepared base.
- **Steps:** add A domain module boundaries, repositories, route skeletons, and contract adapters; no business behavior.
- **Commands/tests:** `pnpm check`; contract tests.
- **Manual/acceptance:** B can import the shared type; routes return explicit not-implemented/domain envelopes.
- **Done/commit:** green check/test; `feat: scaffold claim intelligence domain`.

### A2 — Context, registry, and evidence gate

- **Files allowed:** A registry/context/evidence code and tests.
- **Depends on:** A1.
- **Steps:** implement context-first case creation, rejection contract lookup, supported/unsupported mapping, evidence sufficiency and provenance.
- **Tests:** known codes, unmapped, insufficient, contradictory, retry/idempotency.
- **Acceptance:** no unsupported code enters a supported journey; evidence request names only actionable missing evidence.
- **Commit:** `feat: add claim context and evidence gating`.

### A3 — Comparisons, Mool, timeline, ownership

- **Files allowed:** A diagnosis services/tests.
- **Depends on:** A2.
- **Steps:** implement contract-scoped comparisons, first divergence, service timeline and deterministic owner conditions.
- **Tests:** Fight relation mismatch, Forward exit date, Fix bank, no culpability inference.
- **Acceptance:** exact evidence provenance and stable intermediate outputs.
- **Commit:** `feat: add evidence diagnosis primitives`.

### A4 — Verdict and immutable diagnosis API

- **Files allowed:** A verdict/diagnosis services/routes/tests.
- **Depends on:** A3.
- **Steps:** produce and persist validated `DiagnosisResult`; append version on re-check; implement refusal and safe Do Not Touch.
- **Tests:** golden fixtures, versioning, all verdict/refusal branches, duplicate request.
- **Acceptance:** one deterministic output; no B-owned writes.
- **Commit:** `feat: implement deterministic diagnosis contract`.

### A5 — Diagnosis UI and integration readiness

- **Files allowed:** A UI/routes/tests only; `docs/DESIGN.md` governs every frontend choice.
- **Depends on:** A4.
- **Steps:** build diagnosis screens/states and connect real provider; keep resolution CTA as a contract handoff.
- **Tests/manual:** mobile 390px replay of Fight, Forward, Fix, Unsupported; loading/error/empty/data.
- **Acceptance:** B fixture and A API render the same diagnosis contract; no internal verdict jargon as primary copy.
- **Commit:** `feat: build claim intelligence diagnosis experience`.

### A6 — A verification gate

- **Depends on:** A5.
- **Commands:** `pnpm check && pnpm test && pnpm build`; provide integration notes and contract fixtures.
- **Acceptance:** ready for I1; no shared-file drift.
- **Commit:** `test: verify claim intelligence golden flows`.

## Builder OS Part 2 — Technical Reference

### 10. Tech Stack

Next.js 15 App Router, React 19, strict TypeScript, Next route handlers, Drizzle ORM/Postgres on Supabase, Zod, Vitest, Playwright, Biome, pnpm, deployed on Vercel. No auth or external EPFO integration is required for the simulated P0. Forbidden: CSS-in-JS, Redux/SWR, npm/yarn, `any`, class components, MUI/Chakra/Mantine, moment/date-fns, barrel imports, and production `console.log`.

### 11. File Structure

Create only A-owned modules under the repo-native feature/API paths selected in A1. Shared domain/schema files already exist. Keep diagnosis services, repositories, validators, routes, screens, and tests isolated from B's `resolution-recovery` paths.

### 12. Environment Variables

Server-only: `DATABASE_URL`, `NODE_ENV`, `AI_PROVIDER_API_KEY` (optional). Public: `NEXT_PUBLIC_ANALYTICS_ENV`. `NIDHI_FIXTURE_MODE` is development configuration. Vercel receives these through project environment settings; Supabase credentials never enter source.

### 13. System Design & Key Flows

Use `validate → load context → decode → select records → evidence gate → compare/derive → owner/verdict → persist version → return contract`. Each stage has a typed failure; extraction uncertainty becomes evidence/refusal. DB writes for a diagnosis are atomic. Every state-changing route has an idempotency key. External calls are currently absent; future AI calls need timeout/retry and clamped output.

### 14. Integrations

Supabase Postgres is the only runtime integration in P0. AI is optional and cannot choose identity, owner, verdict, or transition. Analytics uses the shared snake_case event names. Vercel serves the Next app. No auth, email, payments, or realtime subscriptions.

### 15. Security Checklist

- [ ] Validate params/body with Zod and use parameterized Drizzle queries.
- [ ] Keep Supabase service credentials server-only; never log raw evidence/PII.
- [ ] Apply case ownership/auth policy when auth is introduced; prototype uses synthetic isolated cases.
- [ ] Reject uploads by type/size if S12 upload is enabled; store outside public assets.
- [ ] Refuse production seed and do not claim external submission.

### 16. Performance Targets

Initial diagnosis API P95 < 500ms in fixture mode; initial page LCP < 2.5s; no N+1 record loading. If real extraction becomes the long pole, queue it behind the evidence gate rather than blocking the UI indefinitely.

### 17. CI/CD & Deploy Topology

GitHub CI runs install, check, test, and build. Vercel deploys `main`; feature branches use preview deployments only when explicitly requested. Supabase dev and production projects must be separate. Before merge: migration applied, seed verified, env parity checked, and golden flows replayed at 390px.

### 18. Known Limitations

Simulated claim context, no authentication, no live EPFO reads/writes, secondary-source rule verification, and no real document storage are deliberate P0 limits. Historical member-ID self-service remains unknown and uses the safe route.

## Builder OS Part 3 — Build Plan to v0

### 19. Pre-Flight

- [ ] Start from the prepared SHA and run `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm preflight`; verify Supabase `DATABASE_URL` only if DB-backed work is enabled.
- [ ] Read PRD, journeys, shared contract, and `docs/DESIGN.md`; no load-bearing hypothesis remains.

### 20. Sessions

The ordered A1–A6 playbook above is the chunk map. Each session stops on a red check and creates one conventional commit. Each session also includes this agent prompt: **“Read Blueprint §§1–9 and the shared contract; implement only this session’s files; obey `docs/DESIGN.md` as the sole frontend source; run the listed commands; do not invent schema/API boundaries; stop if a shared change is required.”**

### 21. Checkpoints

- **I1:** A API returns a real response validating against `DiagnosisResult` and B can swap off fixtures.
- **I2:** Fight, Forward, Fix, and Unsupported diagnosis paths replay end-to-end.

### 22. Audits

Resilience audit: validate inputs, idempotency, atomic writes, no PII logs, explicit refusal. Functional audit: replay every A-owned screen with loading, empty, error/retry, data, unsupported, back, and resume states.

### 23. Deploy Order

Local checks → Supabase migration/schema verification → deterministic seed → Vercel preview → golden E2E → Vercel production via `main`. No live external integration is enabled in P0.

### 24. Week-1 Tracking

Track supported diagnosis rate, golden verdict agreement, refusal precision, evidence requests, and `diagnosis_refused`; never optimize refusal rate by guessing.

## Gate

- [ ] ⭐ decision is green and no load-bearing 🔵 remains.
- [ ] Every A chunk has owner/boundary/acceptance criteria.
- [ ] `DiagnosisResult` contract tests and golden fixtures pass.
- [ ] `pnpm check`, `pnpm test`, `pnpm build` pass.
