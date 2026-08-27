# 02 — Harden resolution persistence and idempotency

**What to build:** Resolution simulations, actions, handoffs, receipts, and re-checks remain durable, transactional, and duplicate-safe across requests and process restarts.

**Blocked by:** 01 — Complete Claim Intelligence API.

**Status:** complete locally; database integration pending

- [x] Simulation, handoff, receipt, and re-check idempotency has a durable schema/API path.
- [x] Multi-row writes are transactional in the database adapter.
- [x] Re-check outcomes and history are persisted without mutating diagnosis history.
- [x] Tracking returns saved artifacts and current journey state.
- [ ] Integration tests against a configured Postgres instance prove duplicates, retries, and B-only writes.
