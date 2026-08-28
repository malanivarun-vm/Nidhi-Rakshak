# Final Push: Nidhi Rakshak — Harshit / Resolution & Claim Recovery

> The last 5% that makes the next action feel safe. Read before B6 and I1. Nothing here adds product scope.

## Part 1 — The kill shot: one safe next action

The demo must show that the member receives one accountable next step, not a second investigation. Use the same `DiagnosisResult` for the Fight, Forward, Fix, and Refusal cases.

### 90-second resolution script

| Beat | Action | Message |
|---|---|---|
| 1 | Receive Varun’s diagnosis | “The system has already checked the relevant records.” |
| 2 | Fight | “Do not change your current details; resolve this with EPFO.” |
| 3 | Forward | “Your previous employer needs to update this.” |
| 4 | Fix | “Correct this one bank detail; the simulation shows the supported blocker changing.” |
| 5 | Consent/artifact | “Here is exactly what will be shared. This prototype does not submit it.” |
| 6 | Re-check | “We check the blocker again; we never promise approval.” |

## Part 2 — Final verification

- [x] Fixture mode works without Varun’s branch.
- [x] No B code computes owner, blocker, Mool, or verdict.
- [x] Simulation contains before/after, delta, safe flag, and disclaimer.
- [x] Actions/handoffs require consent and idempotency.
- [x] Receipts and tracking show synthetic/simulated status.
- [x] Re-check handles resolved, same blocker, and new blocker.
- [x] `docs/DESIGN.md` is the only frontend authority; `lucide-react` is the only icon library.

## Part 3 — Integration choreography

At I1, replace only the fixture provider with Varun’s validated `DiagnosisResult` provider. Do not rewrite UI or duplicate logic. At I2, run Fight receipt/tracking, Forward artifact/tracking, Fix simulation/re-check, and Unsupported refusal. At I3, audit consent, idempotency, PII safety, and all state transitions.

## Part 4 — Failure pivot

If A’s live endpoint is unavailable, use the frozen fixture and state that the contract is the seam. If artifact generation fails, show retry and preserve the case. If Supabase is unavailable, stay in fixture mode. Never claim a grievance, employer update, or EPFO submission occurred.

## Part 5 — Ship checklist

```bash
pnpm preflight
pnpm check
pnpm test
pnpm build
git diff --check
git status
```

After I2, the integration driver applies the frozen migration to Supabase dev, verifies deterministic seed output, deploys a Vercel preview, and promotes only after manual 390px/1280px replay of all four golden flows. Do not deploy B’s feature branch directly to production.

## Release verification evidence — 2026-08-28

Candidate `3acd18f4b07227ff71d84b1889c5308c35fd446d` passed local fixture fallback: `pnpm check`, 86 unit tests, preflight, build, and 7 Playwright tests covering Fight receipt/reload/tracking, Forward handoff/tracking, Fix simulation/consent/re-check, Unsupported refusal, synthetic upload fallback, and no overflow at 375px/1440px.

The release contains diagnosis/action/handoff/receipt idempotency migrations, but no Supabase connection was available. Persisted duplicate-request, restart, migration/index, and real provider results are therefore unverified. No Vercel environment changed and no Preview was created. GitHub had already deployed the candidate to Production, `READY`, at `https://nidhi-rakshak-4ij38wef2-malanivarun-7789s-projects.vercel.app`; this session did not promote it. Camera permission, keyboard/focus/accessibility audit, and 390px/1280px replays remain unverified.

### Infrastructure update — 2026-08-28

Supabase authentication/link later succeeded and `supabase db push` reported no pending migration. The approved seed did not change the database: Vercel’s listed `POSTGRES_*` variables export as empty in this session, so the seed attempted only local Postgres and failed before SQL. A real non-empty database connection is the remaining prerequisite for persisted flow/idempotency and Preview verification.

### Live verification update — 2026-08-28

Live Supabase verification is complete through local candidate `cc80c4ef8583b7584598bd4945af68e27bb57695` (not pushed to `main`): migration is current; deterministic seed verification passed for 500 claims/cases across 125 member scopes; all four current golden cases and resolution idempotency indexes were confirmed. Database-provider replay passed and `DiagnosisResult.parse` preserved every required identity/version field.

Preview `https://nidhi-rakshak-rdy80s979-malanivarun-7789s-projects.vercel.app` is `READY` with real-provider mode and an isolated transaction-pooler runtime URL. Its API replay passed Fight action/receipt/tracking/same-blocker, Forward action/employer handoff/tracking, Fix safe simulation/action/resolved re-check, and Unsupported refusal/evidence capture. The evidence upload initially revealed an in-memory-only bug; local commit `cc80c4e` persists and reloads it through `evidence_items`, proven again by a separate Preview request.

Local fixture checks now pass with 88 tests (one database-only skip), preflight, build, and 10 browser tests including keyboard activation and 390px/1280px no-overflow checks. The focused real-database suite passes serially (9/9); a parallel complete database suite has three golden-flow timeouts under the shared pooler and is not a release pass. Production is unchanged. The Supabase cleanup reset then disconnected and read-only Session-pooler probes stalled; do not push/promote until clean-state counts can be confirmed. Preview browser/camera checks also need a Vercel SSO bypass.
