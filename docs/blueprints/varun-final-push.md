# Final Push: Nidhi Rakshak — Varun / Claim Intelligence

> The last 5% that makes diagnosis trustworthy. Read before A6 and I1. Nothing here adds product scope.

## Part 1 — The kill shot: evidence before action

The demo must show that Nidhi Rakshak can identify the first observable divergence and stop a harmful correction. Use the Fight golden case, then the Forward, Fix, and Refusal cases. Say:

> “We did not ask the member to retype the rejection. We showed the record that diverges, proved what not to change, and refused when the evidence was not enough.”

### 90-second diagnosis script

| Beat | Action | Message |
|---|---|---|
| 1 | Open rejected claim context | “The claim context is already here.” |
| 2 | Decode relation mismatch | “We found the problem.” |
| 3 | Show diff/Mool | “This older record is where the values first diverge.” |
| 4 | Show Do Not Touch | “Your current details are correct. Don’t change them.” |
| 5 | Open falsifier | “Here is what would prove us wrong.” |
| 6 | Hand off DiagnosisResult | “Resolution can now act without re-diagnosing.” |

## Part 2 — Final verification

- [x] Fight result has `doNotTouch.applies=true`, EPFO owner, FIGHT verdict, falsifier.
- [x] Forward result names employer ownership and date-of-exit blocker.
- [x] Fix result names one bank field and member correction route.
- [x] Unsupported has no verdict and no simulated action.
- [x] Mool distinguishes verified/inferred/unknown.
- [x] `docs/DESIGN.md` is the only frontend authority; `lucide-react` is the only icon library.

## Part 3 — Integration choreography

At I1, provide Harshit the real A endpoint and a captured validated response. Harshit changes only the provider adapter. At I2, replay all four flows in the running app. At I3, run migration/seed/check/test/build and inspect the diff for PII, forbidden packages, shared-file drift, and B-table writes.

## Part 4 — Failure pivot

If diagnosis is slow, show the static golden fixture and explain the contract. If a route fails, show the refusal state; never improvise a verdict. If the live Supabase connection is unavailable, keep fixture mode and report the provider check as a setup item rather than fabricating live data.

## Part 5 — Ship checklist

```bash
pnpm preflight
pnpm check
pnpm test
pnpm build
git diff --check
git status
```

After I2, the integration driver applies the frozen migration to the Supabase dev project, verifies the 500-case seed, deploys a Vercel preview, and promotes only after the four golden journeys pass. Do not deploy from Varun’s feature branch directly to production.

## Release verification evidence — 2026-08-28

Candidate: `3acd18f4b07227ff71d84b1889c5308c35fd446d` (`origin/main`). Fixture fallback passed `pnpm check`, `pnpm test` (19 files, 86 tests), `pnpm preflight`, `pnpm build`, and `pnpm test:e2e` (7 Playwright tests). The typed adapter parsed all four current cases unchanged: Fight `case-golden-fight-relation-name`, Forward `case-golden-forward-exit-date`, Fix `case-golden-fix-bank`, and Unsupported `case-golden-unsupported`.

Fixture preflight generated 500 cases. Its claim references form 125 distinct member scopes: `demo-member-001` owns all four golden cases, and the remaining 496 cases are spread across 124 further four-case scopes. This is generator evidence only; no hosted database row count was obtained.

With fixture mode disabled and no `DATABASE_URL`, the API returned the typed `DIAGNOSIS_PROVIDER_UNAVAILABLE` response rather than serving fixture data. Real database replay, persisted `DiagnosisResult.parse` proof, contract-field preservation, migration/index inspection, and restart-safe idempotency remain unverified: this session had neither `SUPABASE_ACCESS_TOKEN` nor `DATABASE_URL`, and the CLI could not complete interactive login. No migration/reset/seed or Vercel environment change occurred.

All four fixture browser journeys passed locally, including synthetic upload fallback and no overflow at 375px/1440px. Camera permission, keyboard/focus/accessible-label audit, and 390px/1280px replays remain unverified. GitHub had already auto-deployed this candidate to Production as `READY` at `https://nidhi-rakshak-4ij38wef2-malanivarun-7789s-projects.vercel.app`; this session did not promote it or create a Preview. The requested legacy Forward/Fix/Refusal IDs are not present in this candidate; the current IDs above are its implemented contract.

### Infrastructure update — 2026-08-28

Supabase CLI authentication and repository link to `qiinbeyviqctxscryjhw` subsequently succeeded. `supabase db push` reported the remote database up to date; no migration was pending. The approved seed was attempted but made no database change: Vercel lists `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, and `POSTGRES_PRISMA_URL`, yet its Production environment export supplied them as empty values. The seed therefore refused a local `127.0.0.1:5432` connection. A real non-empty `DATABASE_URL` or Postgres URL is still required before the reset, provider replay, or Preview database-mode gate can proceed.

### Live verification update — 2026-08-28

The live release candidate is now `cc80c4ef8583b7584598bd4945af68e27bb57695` locally (base `3acd18f4b07227ff71d84b1889c5308c35fd446d`); neither local fix is pushed to `main`. Supabase `qiinbeyviqctxscryjhw` is `ACTIVE_HEALTHY`; `supabase db push` remains up to date. The approved deterministic seed/verify passed with 500 claims and rescue cases, 125 member scopes, a maximum of four claims per member, current golden IDs `case-golden-fight-relation-name`, `case-golden-forward-exit-date`, `case-golden-fix-bank`, and `case-golden-unsupported`, plus the required resolution idempotency indexes.

Database-mode typed provider replay passed for all four golden cases with `DiagnosisResult.parse` and unchanged contract/case/diagnosis/version fields. A connection-pool lifecycle defect was repaired in local commit `2afa7c6`; 40 sequential real diagnosis requests returned 200. A second confirmed defect—Unsupported evidence accepted but kept only in memory—was repaired in `cc80c4e`; the database reload regression and a separate Preview request both proved persistence.

Fixture verification passed: `pnpm check`, 88 tests with one database-only skip, `pnpm preflight`, `pnpm build`, and 10 Playwright tests. The browser suite covers Fight/Forward/Fix/Unsupported, keyboard activation, and no horizontal overflow at 375px, 390px, 1280px, and 1440px. The affected real-database tests pass serially (9/9); a parallel full database-mode run timed out three 5-second golden-flow tests while competing for the shared pooler, so it is not recorded as a pass.

Preview `https://nidhi-rakshak-rdy80s979-malanivarun-7789s-projects.vercel.app` is `READY`. It was deployed with an isolated runtime-only transaction-pooler URL and `NIDHI_FIXTURE_MODE=false`; Production is unchanged. Vercel SSO protects direct browser access, but authenticated `vercel curl` verified `/`, the four-case list, all four diagnosis endpoints, the four journey API paths, and persisted Unsupported evidence. Remaining blockers: the post-test seed reset lost its connection and subsequent read-only Session-pooler probes stalled, so final clean-state counts are not yet confirmed; Preview browser/camera checks remain SSO-protected; no Production promotion is authorized.
