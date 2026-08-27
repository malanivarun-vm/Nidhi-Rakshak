# Claim Intelligence Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixture-only Claim Intelligence diagnosis reader with a safe database-backed provider while preserving the frozen public contract.

**Architecture:** The integration migration adds a diagnosis idempotency key unique per rescue case. An A-owned adapter maps only validated database rows to existing repository interfaces; the provider reads the latest `DiagnosisResult` and reuses the existing route envelope. Fixtures remain available only in explicit fixture mode.

**Tech Stack:** Drizzle ORM/Postgres, TypeScript strict, Zod, Vitest, Next.js 15.

**Spec:** `docs/blueprints/varun-session-playbook.md` A4–A6; `docs/blueprints/00-shared-integration-contract.md`; `docs/blueprints/varun-final-push.md`.

## Global Constraints

- This is an integration-only branch: schema, migration, DB runtime, and A-owned Claim Intelligence files may change; B files and resolution-owned tables may not.
- `DiagnosisResult` v1, `GET /api/rescue-cases/:caseId/diagnosis`, `{ data }`, `ErrorEnvelope`, and `Cache-Control: no-store` remain unchanged.
- The diagnosis key is unique on `(case_id, idempotency_key)`; duplicate diagnosis requests replay the persisted row.
- Validate all JSON payloads with existing Zod schemas. Missing diagnosis returns `null`; database failure becomes the existing retryable provider error.
- No production migration, seed, deployment, or fixture-gate removal without the confirmed Supabase development target and a captured valid response.

---

### Task 1: Make database idempotency representable

**Files:**
- Modify: `src/db/schema.ts`
- Modify: `drizzle/0000_handy_karnak.sql`
- Modify: `drizzle/meta/0000_snapshot.json`
- Test: `src/db/schema.test.ts`

**Interfaces:** `diagnosisRuns.idempotencyKey: varchar(200)` and unique `(caseId, idempotencyKey)`.

- [ ] Write a schema-source regression asserting `idempotency_key` and the composite unique index appear in the generated SQL.
- [ ] Run it and observe the missing-column failure.
- [ ] Add the non-null column and composite unique index consistently to Drizzle schema, SQL, and snapshot.
- [ ] Re-run the regression.

### Task 2: Add database adapter and latest-diagnosis provider

**Files:**
- Create: `src/db/index.ts`
- Create: `src/features/claim-intelligence/drizzle-repositories.ts`
- Modify: `src/features/claim-intelligence/diagnosis-provider.ts`
- Modify: `src/features/claim-intelligence/diagnosis-api-provider.ts`
- Test: `src/features/claim-intelligence/drizzle-repositories.test.ts`

**Interfaces:** `createDrizzleDiagnosisRepository(db).getLatestByCaseId(caseId)` validates database JSON as `DiagnosisResult`; `createDatabaseDiagnosisProvider(repository)` implements `DiagnosisProvider`.

- [ ] Write tests for valid latest row, absent row, malformed result, and provider failure propagation.
- [ ] Run and observe missing-module failure.
- [ ] Implement the injectable adapter with Drizzle `desc/eq` query semantics; return `null` only for no row and parse every `result` with `DiagnosisResult`.
- [ ] Update the API factory so fixture mode uses fixtures and non-fixture mode requires the database provider; retain the existing route error behavior.
- [ ] Re-run focused tests.

### Task 3: Verify and hand off

**Files:** all above, plus this plan.

- [ ] Run `pnpm check`, `pnpm test`, `NIDHI_FIXTURE_MODE=true pnpm preflight`, `pnpm build`, and `git diff --check`.
- [ ] Audit only A/integration paths changed, no B table writes or `console.log` in runtime code.
- [ ] Do not call migration or seed against a hosted target. Record that live I1 remains blocked until a confirmed Supabase development URL and captured schema-valid response are supplied.

## Self-Review

- The plan covers the missing durable idempotency storage, database reader/provider swap, contract validation, and all local verification.
- It deliberately excludes B work and any live database mutation.
