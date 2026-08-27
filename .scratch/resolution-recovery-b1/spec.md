## Problem Statement

Resolution work needs a stable boundary that can consume a finalized diagnosis while Claim Intelligence is built separately.

## Solution

Create a B-owned resolution shell with one provider seam, fixture selection for the four golden cases, a route envelope, and an explicit resolution state model.

## User Stories

1. As a resolution flow, I want to load a validated diagnosis by case ID, so that resolution never depends on diagnosis internals.
2. As a developer, I want all four golden diagnoses available through one provider, so that B can be built before A is integrated.
3. As a developer, I want the provider to return the exact shared `DiagnosisResult`, so that B cannot accidentally recompute verdict, owner, or blocker.
4. As a client, I want a predictable resolution route envelope, so that later screens can consume the shell without changing their data boundary.
5. As a resolution flow, I want explicit states for loading, data, empty, error, and refusal, so that later UI can handle every contract outcome.

## Implementation Decisions

- B owns a provider interface with an async `getDiagnosis(caseId)` method.
- The fixture provider selects only the four stable golden case IDs and validates the returned value with the shared `DiagnosisResult` schema.
- The provider returns the diagnosis unchanged. B does not derive diagnosis data from `rejectionCode` or any other field.
- The B route is `GET /api/resolution/[caseId]` and returns the shared `{ data }` or `{ error }` envelope.
- The route accepts a stable fixture case ID and returns a resolution shell containing the diagnosis plus the initial state model.
- The state model is a discriminated union for loading, data, empty, error, and refusal. Unsupported diagnoses are represented as refusal data without inventing a verdict or action.
- No database writes, migrations, translation, simulation, action persistence, or final UI are part of B1.

## Testing Decisions

- Test public provider behavior with all four golden case IDs and independent expected IDs.
- Test the route handler through its public request/response boundary for every fixture and unknown case.
- Test that returned diagnosis values still pass the shared schema and preserve fixture verdict omissions.
- Do not test private helpers or reimplement diagnosis logic in expectations.

## Out of Scope

- Diagnosis logic, owner/verdict/blocker computation, translation, simulation, consent, actions, artifacts, tracking, re-check, database access, and final UI.

## Further Notes

The provider seam is the planned I1 swap point for A's validated diagnosis response.
