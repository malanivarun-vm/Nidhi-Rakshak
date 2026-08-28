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
