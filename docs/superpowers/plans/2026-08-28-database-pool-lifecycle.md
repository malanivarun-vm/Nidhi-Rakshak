# Database Pool Lifecycle Implementation Plan

> **For agentic workers:** Execute inline only. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent database-mode requests from leaking Postgres pools and exhausting Supabase Session-pooler clients.

**Architecture:** Keep the existing diagnosis/provider interfaces unchanged. Make `src/db/index.ts` own one cached Drizzle database and Postgres pool per connection string, with `closeDatabase` closing every cached pool. Isolate the “no provider configured” route test from the now-valid local database environment.

**Tech Stack:** TypeScript, `pg`, Drizzle ORM, Vitest, Supabase Session pooler.

**Spec:** Release verification evidence from candidate `3acd18f4b07227ff71d84b1889c5308c35fd446d`.

## Global Constraints

- Do not change UI, provider seam, `DiagnosisResult`, golden fixtures, ownership, simulation, or resolution decisions.
- Do not log, commit, or expose `DATABASE_URL`.
- Make only the connection-lifecycle and test-environment fixes proven by the `EMAXCONNSESSION` failure.

---

### Task 1: Capture pool reuse and unavailable-provider regressions

**Files:**
- Create: `src/db/index.test.ts`
- Modify: `src/features/claim-intelligence/routes.test.ts`

**Consumes:** `createDatabase`, `closeDatabase`, and the diagnosis route’s environment selection.

**Produces:** Tests that fail when repeated factories create different databases, and that prove the unavailable-provider path clears both fixture and database configuration.

- [ ] **Step 1: Write the failing database-cache test.**

  Add a test that calls `createDatabase("postgresql://example.test/db")` twice, expects object identity, and calls `await closeDatabase()` in cleanup:

  ```ts
  expect(createDatabase(connectionString)).toBe(createDatabase(connectionString));
  ```

- [ ] **Step 2: Run the focused test before implementation.**

  Run: `pnpm exec vitest run src/db/index.test.ts`

  Expected: failure because the existing factory creates a new Drizzle database and Pool each time.

- [ ] **Step 3: Correct the route test’s environment isolation.**

  In the existing unavailable-provider test, preserve and temporarily remove `DATABASE_URL` in addition to `NIDHI_FIXTURE_MODE`; restore both in `finally`.

- [ ] **Step 4: Run the focused route test.**

  Run: `pnpm exec vitest run src/features/claim-intelligence/routes.test.ts`

  Expected: the test expects HTTP 503 only when neither provider configuration is present.

### Task 2: Cache and close pools at the database boundary

**Files:**
- Modify: `src/db/index.ts`
- Test: `src/db/index.test.ts`

**Consumes:** the Task 1 cache assertion.

**Produces:** `createDatabase(connectionString)` returns a cached `Database`; `closeDatabase()` closes all pools and clears all caches.

- [ ] **Step 1: Replace the single `pool` variable with per-connection caches.**

  Use `Map<string, Pool>` and `Map<string, Database>`. `createDatabase` returns a cached database when available; otherwise it creates one `Pool`, wraps it with `drizzle`, stores both, and returns it.

- [ ] **Step 2: Make `getDatabase` delegate to `createDatabase`.**

  Preserve its disabled/no-URL behavior. When enabled, return `createDatabase(process.env.DATABASE_URL)` so provider and persistence paths share the same cached pool.

- [ ] **Step 3: Close every cached pool.**

  Implement `closeDatabase` as:

  ```ts
  await Promise.all([...pools.values()].map((pool) => pool.end()));
  pools.clear();
  databases.clear();
  ```

- [ ] **Step 4: Prove the focused regression tests pass.**

  Run: `pnpm exec vitest run src/db/index.test.ts src/features/claim-intelligence/routes.test.ts`

  Expected: both tests pass with no database connection required.

### Task 3: Prove the database-mode release gate and document it

**Files:**
- Modify: six required `docs/blueprints/*` evidence documents only after results exist.
- Modify: dated Obsidian release session note.

**Consumes:** cached-pool fix and validated local `DATABASE_URL`.

**Produces:** evidence that database mode no longer exhausts Session-pooler clients, or a truthful remaining failure.

- [ ] **Step 1: Run the full database-mode test suite once.**

  Run: `set -a && source .env.local && set +a && NIDHI_FIXTURE_MODE=false pnpm test`

  Expected: no `EMAXCONNSESSION` and no test timeout caused by per-request connection allocation.

- [ ] **Step 2: Replay all four diagnosis endpoints again.**

  Run the local app in database mode and validate each response with `DiagnosisResult.parse`, preserving `contractVersion`, `caseId`, `diagnosisId`, and `version`.

- [ ] **Step 3: Run check, preflight, build, and committed browser suite.**

  Run: `pnpm check`, `pnpm preflight`, `pnpm build`, `pnpm test:e2e`.

  Expected: record fixture-only versus real-database scope accurately; do not treat the fixture-configured Playwright suite as database-flow proof.

- [ ] **Step 4: Update release evidence and commit.**

  Run: `git add src/db/index.ts src/db/index.test.ts src/features/claim-intelligence/routes.test.ts <specific documentation files> && git commit -m "fix: reuse database pools in provider mode"`.

  Expected: one focused conventional commit with no secrets and no unrelated changes.

## Self-Review

- Scope is limited to the factory that created leaked pools and the route test whose assumption is invalid when a database is configured.
- The provider interface and diagnosis contract remain untouched.
- The release’s current failure is explained by the failing stack trace and source path: route/provider factory → `createDatabase` → uncached `new Pool` → Supabase `EMAXCONNSESSION`.
