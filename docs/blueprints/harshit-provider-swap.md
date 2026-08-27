# Resolution provider swap at I1

Resolution consumes one validated `DiagnosisResult`; it never reads A tables or derives a verdict from a rejection code.

1. Keep `NIDHI_FIXTURE_MODE=true` while verifying the B-only branch.
2. Implement `ResolutionDiagnosisProvider.getDiagnosis(caseId)` in the integration adapter using Varun’s validated response.
3. Parse the response with `DiagnosisResult.parse` before returning it.
4. Change only the provider selection in `src/features/resolution-recovery/provider.ts` so `NIDHI_FIXTURE_MODE=false` selects the real adapter.
5. Do not change `ResolutionExperience`, translation, simulation, action, artifact, tracking, or re-check code.
6. Replay Fight, Forward, Fix, and Unsupported with the real provider response and confirm the response preserves `contractVersion: "1"`, `caseId`, `diagnosisId`, and `version`.
7. If the provider is unavailable, restore fixture mode and state that the contract seam is verified but live integration is unavailable.

The provider must not expose credentials to the client, log diagnosis payloads, or claim that a simulated action was submitted externally.
