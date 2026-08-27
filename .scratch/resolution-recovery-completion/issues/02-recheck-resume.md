# 02 — Complete re-check lifecycle and resume state

**What to build:** After a saved action or handoff, a member can reload the case and re-check it, then see a distinct resolved, repeated blocker, or new blocker outcome while all prior diagnosis and action history remains available.

**Blocked by:** 01 — Persist resolution cases behind the documented API contract.

**Status:** ready-for-agent

- [ ] Provider interface supports fixture sequences and a validated future A provider.
- [ ] Re-check persists versioned outcomes and is idempotent.
- [ ] Resolved, same blocker, and new blocker transitions are distinct and history-preserving.
- [ ] Missing or unsupported verdicts remain refusal/no-action.
- [ ] Reload/resume returns the saved journey and current status.
- [ ] Route and service tests cover all outcomes and duplicate re-checks.
