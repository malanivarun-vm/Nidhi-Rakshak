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

- [ ] Fixture mode works without Varun’s branch.
- [ ] No B code computes owner, blocker, Mool, or verdict.
- [ ] Simulation contains before/after, delta, safe flag, and disclaimer.
- [ ] Actions/handoffs require consent and idempotency.
- [ ] Receipts and tracking show synthetic/simulated status.
- [ ] Re-check handles resolved, same blocker, and new blocker.
- [ ] `docs/DESIGN.md` is the only frontend authority; `lucide-react` is the only icon library.

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
