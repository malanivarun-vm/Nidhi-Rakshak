# Nidhi Rakshak — Frozen Preparation Architecture

## Build mode

🟢 **CONFIRMED — greenfield.** The repository contains product documents and brand assets only; there is no package manifest, application source, database client, migration, route, test, or deployment implementation to extend. The preparation therefore establishes the first repo-native Next.js/TypeScript/Drizzle structure described by `AGENTS.md`.

## Load-bearing decision

**Decision:** `rescue_cases` are the aggregate root, and diagnosis is an immutable versioned boundary consumed by resolution.

**Evidence:** The PRD and journeys persist/resume a rejected claim case, require diagnosis history and re-check replacement, and explicitly prohibit B from recomputing verdicts or A from writing resolution state. The schema and `DiagnosisResult` contract encode this as foreign keys plus `diagnosis_runs.version`.

**Confidence:** 🟢 CONFIRMED from product docs and frozen preparation contract.

**Blast radius if wrong:** High. It would rewrite every API, ownership boundary, fixture, and re-check flow.

**Alternative rejected:** A single mutable “case result” record; it loses auditability and makes a later diagnosis indistinguishable from the original.

## Frozen decisions

- Next.js App Router, React 19, strict TypeScript, Drizzle PostgreSQL, Zod, Vitest, pnpm.
- No authentication or external EPFO integration in the prototype; claim context is simulated and every screen labels simulation.
- A owns diagnosis tables and APIs; B owns resolution tables and APIs. Both may read the shared case and finalized diagnosis.
- The database contract is frozen on `main`; feature branches do not create independent migrations.
- Rejection contracts are persisted as JSON payloads in the shared registry table so their verification/support status can be audited without making rule logic dynamic.
- AI is an extraction/explanation aid only. Consequential verdict and ownership rules remain deterministic.
- Vercel is the intended Next.js deployment target and Supabase is the intended hosted Postgres target. Their project credentials are external configuration; no secrets or provider-specific IDs were present in this checkout.

## Confidence register

- 🟢 Product scope, journeys, taxonomy v2, design system, golden cases: directly inspected in `docs/PRD.md`, `docs/journeys.md`, `docs/DESIGN.md`.
- 🟢 Tooling/stack: directly specified in `AGENTS.md` and established in the new preparation scaffold.
- 🟡 EPFO circular details: documented as secondary-source verification in PRD §8.1; no unverified numeric rule is put in member-facing foundation data.
- 🟡 Historical member-ID self-service: unresolved in PRD §8.6; encoded as an explicit safe `UNKNOWN` input and never a load-bearing assumption.
- 🔴 No existing app architecture, auth, deployment, or DB conventions were found; none are silently assumed.
