# 01 — Scaffold fixture-backed resolution shell

**What to build:** A resolution flow can load any of the four golden diagnosis fixtures through one B-owned provider and receive a predictable route response with explicit shell state.

**Blocked by:** None - can start immediately.

**Status:** ready-for-agent

- [x] Provider interface returns unchanged validated `DiagnosisResult` for all four golden case IDs.
- [x] Resolution state model represents loading, data, empty, error, and refusal without diagnosis logic.
- [x] `GET /api/resolution/[caseId]` returns the shared success/error envelope and serves all four fixtures.
- [x] Unknown case IDs return a structured error response.
- [x] `pnpm check` and `pnpm test` pass.

## Comments

Provider seam confirmed by user: async `getDiagnosis(caseId)` with fixture implementation now and A implementation at I1.
