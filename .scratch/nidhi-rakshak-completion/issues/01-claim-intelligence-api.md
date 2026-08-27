# 01 — Complete Claim Intelligence API

**What to build:** Claim context, rescue-case lifecycle, diagnosis execution, evidence, timeline, and verdict work through the documented API contract with fixture and database modes.

**Blocked by:** None — can start immediately.

**Status:** complete

- [x] Claim context returns validated claim/rejection metadata.
- [x] Case create/read is idempotent and returns current diagnosis state.
- [x] Diagnosis execution returns validated DiagnosisResult.
- [x] Evidence read/write validates provenance and idempotency.
- [x] Timeline and verdict return sourced projections.
- [x] Route tests cover success, empty, malformed input, unsupported, and retryable errors.
