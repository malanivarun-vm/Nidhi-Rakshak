# Nidhi Rakshak — Preparation Report

**Status:** READY for independent implementation. Final prepared SHA is the SHA of the final handoff commit, printed by `git rev-parse main`.

## Repo facts

🟢 Greenfield. Before this pass the repo contained `README.md`, `docs/PRD.md`, `docs/journeys.md`, `docs/DESIGN.md`, assets, and agent instructions; no app, package, schema, migration, test, or deployment implementation existed. The existing uppercase `docs/DESIGN.md` is the sole UI/UX/frontend source of truth.

## Decisions frozen

- `rescue_cases` aggregate root; immutable versioned `DiagnosisResult` boundary.
- A owns diagnosis; B consumes diagnosis and owns resolution.
- Postgres/Drizzle schema is frozen on main; no feature-branch migrations for P0.
- Four stable golden fixtures and Zod validation are shared.
- Fixture mode precedes live diagnosis integration.
- No real EPFO systems or PII.
- Vercel/Supabase are the intended external deployment/database providers; no provider IDs or secrets were found in the checkout, so setup remains an environment verification step.

## Files added/changed

- Foundation: package/TypeScript/Next/Drizzle/Vitest configuration, app shell, env example.
- Contracts: `src/domain/contracts.ts`, golden fixtures, fixture provider, fixture tests.
- Schema: `src/db/schema.ts` and generated migration after tooling verification.
- Operations: seed plan/verification and preflight scripts.
- Docs: architecture, shared contract, A/B blueprints, handoff, this report.

## Database

Tables: claims, claim_rejections, rescue_cases, rejection_contracts, record_snapshots, evidence_items, diagnosis_runs, blockers, timeline_events, proposed_changes, simulations, resolution_actions, handoffs, case_artifacts, case_status_events. A owns diagnosis-side tables; B owns resolution-side tables. Migration file: `drizzle/0000_handy_karnak.sql`; structural migration verification passed. A live Supabase connection was not available in the checkout, so applying it is tomorrow's provider-credential step, not a hidden failure.

## Mock data

Four immutable golden cases exist and validate. The in-memory generator deterministically creates 500 synthetic claim cases with seed `20260828`, preserving golden IDs and reporting distributions. Database insertion is intentionally deferred until the Supabase/local Postgres adapter is connected; no fake rows are presented as persisted.

## Tests and preflight

Passed: `pnpm install`, `pnpm test` (3 tests), `pnpm check`, `pnpm seed:verify` (500 cases), `pnpm preflight`, `pnpm db:migrate` (migration structure), and `pnpm build`. The build emits only a non-blocking Next warning about the parent workspace lockfile.

## Remaining items

Only non-blocking: historical member-ID self-service verification, exact font/EPFO chrome choices already documented in design, live integrations, and relational 500-case insertion adapter. No item blocks A or B from starting against the shared schema and fixtures.

## Tomorrow's first commands

Varun: `git worktree add ../Nidhi-Rakshak-claim-intelligence -b feat/claim-intelligence <PREPARED_SHA>` then `pnpm install --frozen-lockfile && pnpm preflight`.

Harshit: `git worktree add ../Nidhi-Rakshak-resolution-recovery -b feat/resolution-recovery <PREPARED_SHA>` then `pnpm install --frozen-lockfile && pnpm preflight`.
