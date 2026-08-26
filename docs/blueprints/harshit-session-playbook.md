# Session Playbook: Nidhi Rakshak — Harshit / Resolution & Claim Recovery

> The only document Harshit follows linearly. Everything else is reference.
>
> **IG** = [harshit-implementation-guide.md](./harshit-implementation-guide.md)  
> **FP** = [harshit-final-push.md](./harshit-final-push.md)  
> **DESIGN** = `docs/DESIGN.md` (the only UI/UX/frontend source of truth)  
> **PRD** = `docs/PRD.md`  
> **SC** = [00-shared-integration-contract.md](./00-shared-integration-contract.md)

**Estimated wall-clock time:** 6 implementation sessions, 30–45 minutes each, plus final integration.  
**Operator:** Harshit with Claude Code.  
**Starting branch:** `feat/resolution-recovery`  
**Worktree:** `../Nidhi-Rakshak-resolution-recovery`

## How to Use This Playbook

Read the named IG sections, SC, PRD/journeys, and `docs/DESIGN.md`; paste prompts verbatim; smoke-test; commit only on a green done-check. Start with fixtures. Never wait for Varun’s implementation, recompute diagnosis, create a migration, or invent UI rules outside DESIGN.

## Pre-Flight — fresh worktree tomorrow

Run these commands from the repository root. The preparation worktrees are removed after tonight; this creates Harshit’s clean worktree from the prepared `main` branch.

```bash
git checkout main
git pull --ff-only
git worktree add ../Nidhi-Rakshak-resolution-recovery feat/resolution-recovery
cd ../Nidhi-Rakshak-resolution-recovery
pnpm install --frozen-lockfile
pnpm preflight
```

If the branch does not exist on a separate machine, replace the worktree command with `git worktree add ../Nidhi-Rakshak-resolution-recovery -b feat/resolution-recovery <PREPARED_SHA>`.

### Prepared-base checks

- [x] Shared contract, frozen schema/migration, four golden fixtures, fixture provider, deterministic generator, app scaffold, Vercel/Supabase docs, and `lucide-react` are committed.
- [x] `pnpm test`, `pnpm check`, `pnpm preflight`, `pnpm db:migrate`, and `pnpm build` passed on the prepared base.
- [ ] Confirm fixture mode before starting B1.

## Session map

| # | Session | Dependency | Budget |
|---|---|---|---:|
| B1 | Fixture-backed resolution shell | prepared base | 30 min |
| B2 | Translation and simulation | B1 | 45 min |
| B3 | Actions, artifacts, tracking | B2 | 60 min |
| B4 | Re-check lifecycle | B3 | 45 min |
| B5 | Resolution UI and four states | B4 | 60 min |
| B6 | Golden regression and handoff | B5 | 30 min |

## Session B1 — Fixture-Backed Resolution Shell

**Read:** IG §§1–8; SC; DESIGN.  
**Files allowed:** `src/features/resolution-recovery/**`, B routes/tests.  
**Files forbidden:** A paths, shared contract/schema/migrations, root layout, global CSS.

**Claude Code prompt:**

```text
You are Harshit implementing Session B1. Read the Harshit IG §§1–8, SC, PRD, journeys,
and docs/DESIGN.md. Build only the B-owned module boundaries, fixture selector, provider
interface, route skeleton, and state model. Use the exact shared DiagnosisResult and four
golden fixtures. Do not wait for A, do not recompute verdict/owner/blocker, do not create
migrations or shared types, and do not build final UI yet. Run pnpm check and pnpm test.
Stop if a protected/shared file is needed.
```

**Done-check:** all four fixtures render through B provider; no diagnosis logic exists; route envelope compiles.  
**Commit:** `feat: scaffold resolution recovery domain`.

## Session B2 — Translation and Try Before You Touch

**Read:** IG §§5–8/13, PRD §§13–16/19, journeys S9/S11/S21.  
**Goal:** translate result fields into member copy and implement safe simulation.  

**Claude Code prompt:**

```text
Implement Session B2 only. Consume DiagnosisResult fields exactly as provided. Implement
member-facing translation for FIX/FIGHT/FORWARD/NONE, owner/route copy, proposed before and
after state, blocker delta, safety result, and simulation disclaimer. B must not derive a
verdict, owner, Mool, or diagnosis from rejectionCode. Unsupported/needs-evidence results
must have no consequential action. Add tests for all golden fixtures, unsafe changes, no
verdict, and duplicate simulation. Use Zod and the shared envelope. Do not edit A/shared
files. Run pnpm check && pnpm test.
```

**Done-check:** simulations say only what they prove, never approval; internal taxonomy is not unexplained UI copy; tests green.  
**Commit:** `feat: add resolution translation and simulation`.

## Session B3 — Consent, Actions, Artifacts, Tracking

**Read:** IG §§4–8/13–15, PRD §§20–22, journeys S14–S17.  
**Goal:** persist consented simulated actions, handoffs, receipts, and tracker state.  

**Claude Code prompt:**

```text
Implement Session B3 only. Build consent preview and explicit approval, idempotent
simulated action persistence, owner-specific employer/EPFO/bank artifacts, stable receipt
payload, and tracking/status history. Every multi-row write is atomic; every retryable
state change has an Idempotency-Key; artifact failures are retryable and never imply
external submission. Use only B-owned tables. Add integration tests for consent, duplicate
action, wait/no-action, each owner route, receipt creation, tracker projection, and failed
artifact generation. Do not modify A/shared files or schema.
```

**Done-check:** every action has consent, audit history, safe retry, owner artifact, and simulated label.  
**Commit:** `feat: add recovery actions and case artifacts`.

## Session B4 — Re-check and Repeated Rejection

**Read:** IG §§2/5/8/13, PRD §§23–24, SC versioning.  
**Goal:** call the diagnosis contract and render resolved/same/new blocker outcomes.  

**Claude Code prompt:**

```text
Implement Session B4 only. Add a diagnosis-provider seam that can use fixture sequences
now and Varun’s validated API at I1 later. Implement re-check persistence and transitions:
resolved, same blocker/repeated rejection, and different blocker/new diagnosis. Preserve
all prior action and diagnosis history. Do not recompute or infer diagnosis in B. Add tests
for all three outcomes, reload/resume, duplicate re-check, and a missing/unsupported
verdict. Do not edit A/shared files or migrations.
```

**Done-check:** re-check has no B-side blocker logic and history is preserved.  
**Commit:** `feat: add recovery recheck state machine`.

## Session B5 — Resolution UI and Four States

**Read:** IG §7/16/18 and DESIGN in full; journeys S9/S11/S14–S18.  
**Goal:** build the polished resolution experience fixture-first.  

**Claude Code prompt:**

```text
Implement Session B5 only. Read docs/DESIGN.md as the sole UI/UX/frontend authority.
Build resolution summary, Try Before You Touch, Fix/Fight/Forward/Wait paths, consent,
handoff, receipt, tracking, re-check, resolved, repeated rejection, and no-action screens.
Use fixture-backed DiagnosisResult and lucide-react only. Cover loading, empty, error+retry,
data, refusal/wait, back, reload/resume, and simulated labels. Never expose unexplained
internal verdict words or promise claim approval. Do not touch A/shared/global files. Smoke
test all four golden loops at 390px and 1280px.
```

**Done-check:** B can complete all four loops with fixture mode; UI is ready for provider swap without rewrite; tests/build green.  
**Commit:** `feat: build claim recovery experience`.

## Session B6 — Golden Regression and Handoff

**Read:** IG §§20–24, FP, SC.  
**Goal:** verify B independently and prepare I1.  

**Claude Code prompt:**

```text
Implement Session B6 as verification only. Run pnpm install --frozen-lockfile, pnpm check,
pnpm test, pnpm preflight, pnpm db:migrate, and pnpm build. Replay Fight receipt, Forward
handoff/tracking, Fix simulation/re-check, and Unsupported refusal. Verify B never writes
A-owned diagnosis tables, recomputes verdict, logs PII, or claims external submission.
Inspect protected-file drift and record exact provider-swap instructions for I1. Stop on
failure and fix only B-owned files.
```

**Done-check:** all commands green, fixture provider swap documented, four resolution loops stable.  
**Commit:** `test: verify resolution recovery golden flows`.

## Gate before integration

- [ ] Harshit’s branch contains no A-owned or protected-file edits.
- [ ] No load-bearing 🔵 remains.
- [ ] B consumes, never recomputes, `DiagnosisResult`.
- [ ] FP rehearsal is complete before I1.
