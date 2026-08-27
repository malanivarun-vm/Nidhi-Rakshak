# 01 — Persist resolution cases behind the documented API contract

**What to build:** A member’s consented resolution action, handoff, receipt, and status history survive requests and reloads through B-owned database records, while all resolution endpoints use the documented rescue-case contract and safe envelopes.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Drizzle persistence adapter writes only B-owned records.
- [ ] Action, handoff, artifact, receipt, and status-event writes are transactional where multi-row.
- [ ] Every state-changing endpoint validates input, requires `Idempotency-Key`, and returns the original result for duplicates.
- [ ] Consent and unsupported-diagnosis guards are enforced at the service boundary.
- [ ] Documented `/api/rescue-cases/:caseId/...` routes work with shared success/error envelopes.
- [ ] Integration tests prove persistence, duplicate safety, retryable artifact failure, and no A-table writes.
