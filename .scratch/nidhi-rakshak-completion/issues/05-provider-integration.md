# 05 — Integrate the validated A provider

**What to build:** B switches from fixture mode to the typed in-process A provider without UI or resolution logic changes, and all four golden cases remain valid through the shared DiagnosisResult schema.

**Blocked by:** 01 — Complete Claim Intelligence API; 04 — Add browser golden-flow verification.

**Status:** complete locally; remote provider replay pending

- [x] One adapter seam selects fixture or real A provider.
- [x] Provider responses are parsed with DiagnosisResult.parse.
- [x] Fixture and database modes are selected explicitly.
- [ ] All four golden cases replay through a configured database-backed provider.
