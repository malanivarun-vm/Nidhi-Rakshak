# Nidhi Rakshak — Preparation Report

**Status:** READY for independent implementation. The authoritative prepared SHA is printed by `git rev-parse main` after the final preparation commit.

## Repo facts

🟢 Greenfield. Before this pass the repo contained `README.md`, `docs/PRD.md`, `docs/journeys.md`, `docs/DESIGN.md`, assets, and agent instructions; no app, package, schema, migration, test, or deployment implementation existed. The existing uppercase `docs/DESIGN.md` is the sole UI/UX/frontend source of truth.

## Decisions frozen

- `rescue_cases` aggregate root; immutable versioned `DiagnosisResult` boundary.
- A owns diagnosis; B consumes diagnosis and owns resolution.
- Postgres/Drizzle schema is frozen on main; no feature-branch migrations for P0.
- Four stable golden fixtures and Zod validation are shared.
- Fixture mode precedes live diagnosis integration.
- No real EPFO systems or PII.
- Vercel CLI 58.9.0 is installed, authenticated, and linked locally to the `nidhi-rakshak` Vercel project. Supabase CLI 2.115.0 is installed; local Supabase is running on isolated ports. Remote Supabase account linking still requires an owner-provided `supabase login` or access token.

## Files added/changed

- Foundation: package/TypeScript/Next/Drizzle/Vitest configuration, app shell, env example.
- Contracts: `src/domain/contracts.ts`, golden fixtures, fixture provider, fixture tests.
- Schema: `src/db/schema.ts` and generated migration after tooling verification.
- Operations: seed plan/verification, Supabase local migration, and preflight scripts.
- Docs: architecture, shared contract, Varun and Harshit Builder OS guides/playbooks/final pushes, handoff, this report.

## Database

Tables: claims, claim_rejections, rescue_cases, rejection_contracts, record_snapshots, evidence_items, diagnosis_runs, blockers, timeline_events, proposed_changes, simulations, resolution_actions, handoffs, case_artifacts, case_status_events. A owns diagnosis-side tables; B owns resolution-side tables. The Drizzle migration is `drizzle/0000_handy_karnak.sql`; the Supabase CLI copy is `supabase/migrations/20260827000000_foundation.sql`. `supabase db reset --local --yes` and the migration both passed against the isolated local database on port 55422.

## Mock data

Four immutable golden cases exist and validate. The deterministic generator creates and persists 500 synthetic claim cases with seed `20260828`, preserving the four golden IDs. Database seeding and verification passed against local Supabase. No real PII is generated.

## Tests and preflight

Passed: `pnpm install`, `pnpm test` (3 tests), `pnpm check`, fixture-only `pnpm seed:verify`, local Supabase reset/migration, database `pnpm seed:reset -- --count=500 --seed=20260828`, and database `pnpm seed:verify -- --count=500 --seed=20260828`. `pnpm preflight` is the final gate and uses fixture-only verification so it is safe before a developer starts a local DB.

## Remaining items

Non-blocking: run `supabase login` to access a remote Supabase project, connect the Vercel GitHub integration if remote auto-deploy is desired, historical member-ID self-service verification, exact font/EPFO chrome choices already documented in design, live integrations, and external claim submission. No item blocks Varun or Harshit from starting against the shared schema and fixtures.

## Tomorrow's first commands

Varun: `git worktree add ../Nidhi-Rakshak-claim-intelligence -b feat/claim-intelligence <PREPARED_SHA>` then `pnpm install --frozen-lockfile && pnpm preflight`.

Harshit: `git worktree add ../Nidhi-Rakshak-resolution-recovery -b feat/resolution-recovery <PREPARED_SHA>` then `pnpm install --frozen-lockfile && pnpm preflight`.
