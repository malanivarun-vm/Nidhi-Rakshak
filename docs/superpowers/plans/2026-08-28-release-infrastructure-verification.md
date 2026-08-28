# Release Infrastructure Verification Implementation Plan

> **For agentic workers:** Execute inline only. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify the exact `origin/main` release candidate against Supabase and a Vercel preview, documenting only evidence that was actually obtained.

**Architecture:** Keep the frozen `DiagnosisResult` contract and provider seam unchanged. First prove the deployed database can support the existing database provider, then exercise the existing API and resolution boundaries, then expose the same proven configuration only to a Vercel Preview. Production remains unchanged unless every gate passes and the project owner separately requests promotion.

**Tech Stack:** Supabase CLI/Postgres, Node/TypeScript, pnpm, Vitest, Playwright (if installed), Next.js 15, Vercel CLI.

**Spec:** User release-and-infrastructure instruction, 2026-08-28.

## Global Constraints

- Start from the exact SHA fetched from `origin/main`; record it before any verification.
- Do not change the UI, provider seam, `DiagnosisResult`, golden fixtures, B-series ownership, simulation, or resolution decision logic.
- Do not log, commit, or document any `DATABASE_URL`, access token, service-role key, or password.
- Treat `supabase db push` and a seed reset as writes to the linked database; run them only after explicit owner confirmation of the target project.
- Do not set Vercel Preview or Production to database mode unless the real provider replay succeeds.
- Do not promote to production in this release task.

---

### Task 1: Establish the release candidate and preflight capability

**Files:**
- Modify: `docs/blueprints/varun-final-push.md`
- Modify: `docs/blueprints/varun-implementation-guide.md`
- Modify: `docs/blueprints/varun-session-playbook.md`
- Modify: `docs/blueprints/harshit-final-push.md`
- Modify: `docs/blueprints/harshit-implementation-guide.md`
- Modify: `docs/blueprints/harshit-session-playbook.md`

**Consumes:** `origin/main`, Supabase/Vercel CLI account access, the existing local worktree.

**Produces:** A recorded immutable SHA and an evidence log that distinguishes unavailable access from failed checks.

- [ ] **Step 1: Fetch the remote release candidate without altering local files.**

  Run: `git fetch origin main && git rev-parse origin/main && git status --short --branch`

  Expected: one 40-character SHA for `origin/main`; any pre-existing working-tree changes are recorded and preserved.

- [ ] **Step 2: Confirm required local tools and scripts.**

  Run: `supabase --version && vercel --version && pnpm --version && node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts,null,2))"`

  Expected: tool versions and the exact available scripts. Record an absent `test:e2e` command as a test-gate blocker rather than claiming it ran.

- [ ] **Step 3: Inspect the seed/schema consistency before running a destructive reset.**

  Run: `rg -n "ALLOW_DEMO_SEED|members|demo-member-001|seed:reset|seed:verify" scripts src supabase package.json`

  Expected: confirm whether the requested 125-member and `demo-member-001` requirements are representable by the current schema and seed script.

- [ ] **Step 4: Classify any setup incompatibility as a confirmed bug before changing it.**

  Evidence rule: if the seed safety gate rejects the owner-approved affirmative flag, or the generated data cannot represent the required member distribution, document the mismatch and make the smallest test-first repair only after confirmation.

### Task 2: Safely connect Supabase and verify the database baseline

**Files:**
- Modify only if a confirmed setup bug blocks this task: `scripts/seed.ts`, matching seed tests, and a migration only if a member model is explicitly approved.
- Modify: the six required blueprint documents with factual results.

**Consumes:** Explicit confirmation of the exact linked Supabase project and approval to apply migrations/reset its synthetic data.

**Produces:** A migrated database plus seed-count and index evidence, or a precise access/schema blocker.

- [ ] **Step 1: Authenticate and link the intended project.**

  Run: `supabase login` followed by `supabase link --project-ref <confirmed-project-ref>`.

  Expected: CLI shows the exact project ref; never print connection credentials.

- [ ] **Step 2: Apply tracked schema migrations.**

  Run: `supabase db push`

  Expected: `20260827000000_foundation.sql` and `20260827000100_diagnosis_idempotency.sql` applied or confirmed already applied.

- [ ] **Step 3: Obtain `DATABASE_URL` securely and run the deterministic seed only if its safety gate is correct.**

  Run with the value supplied only through process environment, never shell history or documentation:

  ```bash
  export DATABASE_URL='<provided securely>'
  export ALLOW_DEMO_SEED=true
  pnpm seed:reset
  pnpm seed:verify
  ```

  Expected: a successful reset and verification for 500 cases. If the existing guard rejects the requested approved value, stop and add a regression test that proves only an explicit affirmative flag allows a non-production reset; do not bypass the guard.

- [ ] **Step 4: Query only aggregate, non-secret database facts.**

  Check 500 claims/cases, any available member count and distribution, all four golden `caseId` values in `diagnosis_runs.result`, and the `diagnosis_runs_case_idempotency_key_idx` index. Capture counts and booleans, never connection data or raw member PII.

  Expected: evidence for every requested data invariant, or a truthful blocker where the data model cannot represent it.

### Task 3: Real-provider replay through the frozen boundary

**Files:**
- Modify only for a confirmed provider setup defect: an existing provider test and the smallest server-only setup code required.
- Modify: the six required blueprint documents with replay evidence.

**Consumes:** Migrated, seeded database; `DATABASE_URL`; `NIDHI_FIXTURE_MODE=false` in the verification process.

**Produces:** Four parsed `DiagnosisResult` replay records, or a documented missing credential/route limitation.

- [ ] **Step 1: Prove provider selection and ownership boundaries by inspection and tests.**

  Run: `rg -n "createDiagnosisApiProvider|createDatabaseDiagnosisProvider|diagnosis_runs|blockers" src app tests`

  Expected: the API gets data through `createDiagnosisApiProvider`; consumer code does not query/write provider-owned diagnosis tables directly.

- [ ] **Step 2: Start the app with the real provider only.**

  Run: `NIDHI_FIXTURE_MODE=false DATABASE_URL='<provided securely>' pnpm dev`

  Expected: server starts without falling back to fixtures. If a credential or service is missing, capture its exact variable/service name and stop real-provider claims.

- [ ] **Step 3: Replay each golden diagnosis endpoint and parse the response.**

  Request these case IDs through the deployed local API boundary: `case-golden-fight-relation-name`, `case-golden-forward-missing-last-working-day`, `case-golden-fix-bank-ifsc`, and `case-golden-refusal-unsupported`.

  Expected for each: response envelope success and `DiagnosisResult.parse(payload.data)` succeeds with unchanged `contractVersion`, `caseId`, `diagnosisId`, and `version`.

- [ ] **Step 4: Record the four journey classifications without recomputing them.**

  Expected: Fight, Forward, Fix, and Unsupported/refusal come from the persisted provider result. Do not fabricate a successful replay if no real writer or valid persisted rows exist.

### Task 4: Integrated code, API, and browser verification

**Files:**
- Modify only for confirmed release-blocking defects, with regression coverage.
- Modify: the six required blueprint documents with command and replay results.

**Consumes:** a passing real-provider replay; existing test commands and browser tooling.

**Produces:** command output evidence plus explicit pass/block status for each required journey, state, viewport, and accessibility assertion.

- [ ] **Step 1: Run the declared static and automated suites under database mode.**

  Run: `NIDHI_FIXTURE_MODE=false pnpm check`, `NIDHI_FIXTURE_MODE=false pnpm test`, `NIDHI_FIXTURE_MODE=false pnpm preflight`, and `NIDHI_FIXTURE_MODE=false pnpm build`.

  Expected: capture each pass/fail. Run `pnpm test:e2e` only if the script exists; otherwise record its absence as a blocker.

- [ ] **Step 2: Test idempotent API behavior using duplicate requests and a restarted server.**

  Expected: simulation, action, handoff, receipt, and re-check each return one stable persisted result for repeated requests with the same idempotency key; reload/resume restores receipt and handoff state. If the route is currently `501`, record it instead of treating fixtures as persistence.

- [ ] **Step 3: Replay the full golden paths in a real browser.**

  Expected: Fight (diagnosis → simulation → consent → receipt → tracking), Forward (diagnosis → ownership → employer handoff → tracking), Fix (diagnosis → simulation → correction route → re-check), Unsupported (refusal → camera/upload evidence → safe fallback). Record each state as pass, fail, or unavailable.

- [ ] **Step 4: Verify browser quality at 390px and 1280px.**

  Expected: no horizontal overflow; keyboard-visible focus; keyboard-operable controls; accessible labels/disabled/retry states; camera permission path when supported; synthetic-document upload fallback otherwise. Store screenshots only as local evidence; do not alter UI unless a confirmed defect blocks release.

### Task 5: Vercel preview and environment parity

**Files:**
- Modify: the six required blueprint documents with environment and preview evidence.

**Consumes:** all Supabase and real-provider gates passed, Vercel project access.

**Produces:** Preview URL and endpoint/flow evidence, or a decision to leave Vercel in fixture mode with the exact blocker.

- [ ] **Step 1: Inspect Vercel environment names without printing values.**

  Run: `vercel env ls preview` and `vercel env ls production` after linking only if needed.

  Expected: report whether `DATABASE_URL` and `NIDHI_FIXTURE_MODE=false` exist for Preview and Production, without displaying sensitive values.

- [ ] **Step 2: Change Preview environment only after successful real-provider proof.**

  Expected: Preview receives `DATABASE_URL` and `NIDHI_FIXTURE_MODE=false` securely. Production stays unchanged unless every required gate passes; no production promotion occurs in this plan.

- [ ] **Step 3: Deploy and inspect a Vercel Preview.**

  Run: `vercel` followed by `vercel inspect <preview-url> --logs`.

  Expected: ready preview URL and successful build logs.

- [ ] **Step 4: Test the preview root and four diagnosis endpoints, then replay the four flows.**

  Expected: `/`, `/api/rescue-cases`, and all four specified diagnosis URLs return the expected statuses; record browser/API results and do not promote to Production.

### Task 6: Evidence documentation and safe handoff

**Files:**
- Modify: `docs/blueprints/varun-final-push.md`
- Modify: `docs/blueprints/varun-implementation-guide.md`
- Modify: `docs/blueprints/varun-session-playbook.md`
- Modify: `docs/blueprints/harshit-final-push.md`
- Modify: `docs/blueprints/harshit-implementation-guide.md`
- Modify: `docs/blueprints/harshit-session-playbook.md`
- Create: dated Obsidian session note in `~/Desktop/My Obsidian Vault/Venom Vault/Projects/Nidhi Rakshak/Sessions/`
- Modify: Obsidian `Decisions.md`, `Past Mistakes & Lessons.md`, and `Simply Explained.md` only if the work produces a durable decision, lesson, or new concept.

**Consumes:** exact outputs from Tasks 1–5.

**Produces:** a conventional documentation commit containing only evidence, exact SHA, status matrix, and blockers.

- [ ] **Step 1: Update all six blueprints with a consistent evidence matrix.**

  Include: SHA, migration outcome, schema/index proof, seed counts, golden-case replay details, parse outcome, every command result, browser/responsive/accessibility status, preview URL, environment status, deployment result, and remaining blockers.

- [ ] **Step 2: Perform an adversarial documentation review.**

  Run: `git diff --check && git diff -- docs/blueprints docs/superpowers/plans`

  Expected: no secret values and no pass statement unsupported by captured output.

- [ ] **Step 3: Commit and push only intended documentation/setup-fix files.**

  Run: `git add <specific verified files> && git commit -m "docs: record release verification evidence" && git push origin main`

  Expected: one conventional commit on `main`, with no UI/provider-contract/B-series changes. Do not create a production deployment.

## Self-Review

- Spec coverage: Tasks 1–2 cover CLI link/migration/seed/count/index gates; Task 3 covers typed real-provider replay; Task 4 covers required commands, idempotency, journeys, responsive/accessibility/browser checks; Task 5 gates Vercel Preview; Task 6 covers all required documents, commit, push, and final evidence.
- Verified update after fetching `origin/main`: the candidate includes `test:e2e`, an affirmative production seed safety gate, and deterministic scoped claim references. Fixture preflight proved 500 generated cases and 125 distinct member scopes, with `demo-member-001` holding the four golden cases. Hosted database verification remains pending Supabase authentication and `DATABASE_URL`.
- Type consistency: this plan treats `DiagnosisResult` as the frozen adapter output and does not prescribe any contract or provider-seam change.
