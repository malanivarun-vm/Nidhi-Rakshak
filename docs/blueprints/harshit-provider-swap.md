# Resolution provider seam at I1

Resolution consumes one validated `DiagnosisResult`; it never reads A tables or derives a verdict from a rejection code.

1. Keep `NIDHI_FIXTURE_MODE=true` while verifying the fixture-backed branch.
2. B selects the in-process typed A provider from `src/features/resolution-recovery/provider.ts` when fixture mode is disabled.
3. The A provider reads the diagnosis service/repository and parses the response with `DiagnosisResult.parse` before B receives it.
4. Do not change `ResolutionExperience`, translation, simulation, action, artifact, tracking, or re-check code for the provider swap.
5. Replay Fight, Forward, Fix, and Unsupported with the configured database provider and confirm `contractVersion: "1"`, `caseId`, `diagnosisId`, and `version` are preserved.
6. If the provider is unavailable, restore fixture mode and state that the contract seam is verified but live integration is unavailable.

The provider must not expose credentials to the client, log diagnosis payloads, or claim that a simulated action was submitted externally.
