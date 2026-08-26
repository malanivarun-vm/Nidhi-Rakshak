# Session Playbook: Nidhi Rakshak — Varun / Claim Intelligence

> The only document Varun follows linearly. Everything else is reference.
>
> **IG** = [varun-implementation-guide.md](./varun-implementation-guide.md)  
> **FP** = [varun-final-push.md](./varun-final-push.md)  
> **DESIGN** = `docs/DESIGN.md` (the only UI/UX/frontend source of truth)  
> **PRD** = `docs/PRD.md`  
> **SC** = [00-shared-integration-contract.md](./00-shared-integration-contract.md)

**Estimated wall-clock time:** 6 implementation sessions, 30–45 minutes each, plus final integration.  
**Operator:** Varun with Claude Code.  
**Starting branch:** `feat/claim-intelligence`  
**Worktree:** `../Nidhi-Rakshak-claim-intelligence`

## How to Use This Playbook

Read the named IG sections and `docs/DESIGN.md`, paste the prompt verbatim, smoke-test the running app, then commit only when the done-check is green. Do not invent a table, endpoint, shared type, visual token, or cross-domain dependency inside a session. If a shared change is required, stop and follow SC’s contract-change protocol.

## Pre-Flight — already completed on main

- [x] Shared contract, frozen schema/migration, fixtures, deterministic 500-case generator, Next scaffold, Vercel/Supabase env docs, and `lucide-react` are committed.
- [x] `pnpm test`, `pnpm check`, `pnpm preflight`, `pnpm db:migrate`, and `pnpm build` passed on the prepared base.
- [ ] In this worktree: `pnpm install --frozen-lockfile`, `pnpm preflight`, and confirm `NIDHI_FIXTURE_MODE=true`.

## Session map

| # | Session | Dependency | Budget |
|---|---|---|---:|
| A1 | Contract seam and route skeleton | prepared base | 30 min |
| A2 | Context, registry, evidence gate | A1 | 45 min |
| A3 | Comparisons, Mool, timeline, ownership | A2 | 45 min |
| A4 | Diagnosis and deterministic verdict | A3 | 60 min |
| A5 | Diagnosis UI and four states | A4 | 60 min |
| A6 | Golden regression and handoff | A5 | 30 min |

## Session A1 — Contract Seam and Route Skeleton

**Read:** IG §§1–8; SC; DESIGN principles and component guidance.  
**Goal:** establish A-owned directories, typed repository/service interfaces, fixture contract tests, and route boundaries without business logic.  
**Files allowed:** `src/features/claim-intelligence/**`, A route namespaces, A tests.  
**Files forbidden:** shared contract/schema/package/layout/global CSS, all B files.

**Claude Code prompt:**

```text
You are Varun implementing Session A1 from docs/blueprints/varun-session-playbook.md.
Read the Varun IG §§1–8, docs/blueprints/00-shared-integration-contract.md, docs/PRD.md,
docs/journeys.md, and docs/DESIGN.md. Build only the A-owned contract seam and route
skeleton. Create no business logic, no migrations, no new shared types, and no UI beyond
the smallest compile-safe placeholder. Import the exact DiagnosisResult and fixture
provider. Use lucide-react only if an icon is strictly necessary. Run pnpm check and
pnpm test. Stop and report if a shared/protected file is needed.
```

**Smoke test:** app boots; fixture contract test runs; routes return the shared error/data envelope.  
**Done-check:** A-owned paths compile, B can read the contract without A internals, no protected file changed.  
**Commit:** `feat: scaffold claim intelligence domain`.

## Session A2 — Context, Registry, Evidence Gate

**Read:** IG §§4–8, PRD §§8–10/17/18, journeys shared spine.  
**Goal:** create context-first case handling, taxonomy contract registry, supported/unsupported decoder, provenance, and evidence sufficiency.  
**Files allowed:** A context/registry/evidence modules and tests.  
**Files forbidden:** B domain, shared contract/schema/migrations, frontend globals.

**Claude Code prompt:**

```text
Implement Session A2 only. Read the cited IG, PRD, journeys, and shared contract first.
Implement context-first rejected-claim loading, v2 rejection-contract lookup, pattern
decoding, evidence sufficiency/contradiction handling, and provenance. Unknown or declared
unsupported codes must produce UNSUPPORTED/NEEDS_EVIDENCE, never a guessed family or
verdict. Validate all inputs with Zod and keep writes transactional/idempotent. Add unit
and integration tests for mapped, unmapped, insufficient, contradictory, and retryable
cases. Do not edit shared files or B paths. Run pnpm check && pnpm test and stop if red.
```

**Smoke test:** a known golden code maps; unmapped and insufficient evidence render safe domain states.  
**Done-check:** no duplicate member input, no unsupported code enters supported diagnosis, tests green.  
**Commit:** `feat: add claim context and evidence gating`.

## Session A3 — Comparisons, Mool, Timeline, Ownership

**Read:** IG §§4–8, PRD §§9/12/13/14/16, journeys J1–J7.  
**Goal:** implement contract-scoped record comparison, provenance-sensitive Mool, service timeline, and deterministic ownership.  
**Files allowed:** A record/timeline/diagnosis primitives and tests.

**Claude Code prompt:**

```text
Implement Session A3 only. Build comparison over records named by the rejection contract,
first observable relevant divergence (Mool), service timeline derivation, and ownership
conditions. Mool may describe divergence but must not invent culpability. Preserve VERIFIED,
INFERRED, and UNKNOWN distinctions. Exercise the Fight relation-name, Forward exit-date,
Fix bank, and unsupported fixtures. Do not compute resolution actions or edit B/shared
files. Run unit/integration tests, pnpm check, and manually inspect the JSON outputs.
```

**Done-check:** evidence sources are inspectable; golden intermediate outputs are stable; no blame inference; tests green.  
**Commit:** `feat: add claim intelligence comparison primitives`.

## Session A4 — Diagnosis and Deterministic Verdict

**Read:** IG §§2/5/6/8, SC DiagnosisResult, PRD §§13/18/29/30/31–34.  
**Goal:** persist validated immutable diagnosis versions and emit the exact shared result.  
**Files allowed:** A verdict/diagnosis services, routes, repositories, tests.

**Claude Code prompt:**

```text
Implement Session A4 only. Compose the validated diagnosis pipeline and deterministic
owner/verdict rules. Emit DiagnosisResult contractVersion 1 exactly; omit verdict when
unsupported or evidence is unsafe. Implement Do Not Touch, falsifier, recommended route,
and append-only diagnosis versioning for re-check. Persist A-owned rows atomically and
require idempotency keys. Validate every output with the shared Zod schema. B must consume
this output without recomputing anything. Add regression tests for all four golden cases,
multiple blockers, repeated diagnosis, and duplicate requests. Do not edit B/shared files.
```

**Done-check:** four fixtures match exact expected result; re-check creates version 2; unsupported has no verdict; `pnpm check && pnpm test`.  
**Commit:** `feat: implement deterministic diagnosis contract`.

## Session A5 — Diagnosis UI and Four States

**Read:** IG §§7/16/18 and DESIGN in full before frontend work; journeys screen inventory S1–S8/S10–S13/S19/S21.  
**Goal:** build diagnosis UI using real A API and shared design system.  
**Files allowed:** A UI/routes/tests only; `docs/DESIGN.md` is read-only authority.

**Claude Code prompt:**

```text
Implement Session A5 only. Read docs/DESIGN.md as the sole UI/UX/frontend source of truth.
Build the A-owned diagnosis surfaces: entry, decode, diff, Mool, timeline, missing detail,
Do Not Touch, ownership, evidence request, refusal, resume, and correction route. Use the
shared information hierarchy and lucide-react only. Cover loading, empty, error+retry,
data, unsupported, back, and reload/resume states. Do not build resolution screens or
restate FIGHT/FORWARD/FIX as unexplained member copy. Test at 390px and 1280px in the
browser. Do not edit globals/shared/B files.
```

**Done-check:** Fight, Forward, Fix, Unsupported diagnosis spines are manually traversable; no fake approval promise; mobile layout survives translated text.  
**Commit:** `feat: build claim intelligence diagnosis experience`.

## Session A6 — Golden Regression and Handoff

**Read:** IG §§20–24, FP, SC.  
**Goal:** freeze A’s provider contract and handoff evidence for I1.  

**Claude Code prompt:**

```text
Implement Session A6 as a verification session. Do not add features. Run pnpm install
--frozen-lockfile, pnpm check, pnpm test, pnpm preflight, pnpm db:migrate, and pnpm build.
Run the four golden cases and verify every DiagnosisResult with the shared schema. Inspect
git diff for protected-file drift, raw PII, console.log, forbidden packages, and any B
table writes. Record the exact A API/fixture swap instructions for I1 in the commit body.
Stop on any failure and fix only A-owned files.
```

**Done-check:** all commands green, A/B contract swap documented, four golden diagnosis outputs stable.  
**Commit:** `test: verify claim intelligence golden flows`.

## Gate before integration

- [ ] Varun’s branch contains no B-owned or protected-file edits.
- [ ] No load-bearing 🔵 remains.
- [ ] A emits, never mutates, the shared `DiagnosisResult` boundary.
- [ ] FP rehearsal is complete before I1.
