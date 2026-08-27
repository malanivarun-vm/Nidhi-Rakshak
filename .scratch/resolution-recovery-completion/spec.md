## Problem Statement

The current resolution recovery branch has green unit checks for fixture loading, translation, simulation, and an in-memory recovery service, but it does not yet complete the session playbook. Actions are lost between requests, the documented rescue-case API contract is not the implemented route contract, the UI skips simulation/tracking/recheck outcomes, and there is no end-to-end proof of the four golden flows.

## Solution

Complete Resolution & Claim Recovery against the locked `DiagnosisResult` contract. Use Drizzle/Postgres persistence for B-owned records, preserve append-only diagnosis-linked history, expose the documented rescue-case API envelope, keep fixture mode as the default provider seam, implement simulation, consent, owner-specific artifacts, receipts, tracking, re-check outcomes, reload/resume, and the full member flow. Verify with seam tests, integration tests against the local database where available, production build, deterministic seed/preflight, and a repeatable golden-flow smoke test. All outbound work remains explicitly simulated.

## User Stories

1. As a member, I want the resolution flow to start from the already validated diagnosis, so that I am not asked to investigate the rejection again.
2. As a member, I want the four golden cases to work without the diagnosis branch, so that the prototype can be demonstrated independently.
3. As a member, I want the system to explain who acts next in plain language, so that I know whether to fix, fight, forward, or wait.
4. As a member, I want unsupported or uncertain diagnoses to stop safely, so that the prototype never invents a consequential action.
5. As a member, I want to preview a proposed change before accepting it, so that I can see the before state, after state, blocker delta, safety result, and simulation disclaimer.
6. As a member, I want unsafe changes to be refused, so that the product does not encourage changes that add blockers or violate a do-not-touch warning.
7. As a member, I want to give explicit consent before an action or handoff is recorded, so that no consequential simulated step happens silently.
8. As a member, I want retries to be safe, so that a repeated request does not create duplicate actions, artifacts, receipts, or status events.
9. As a member, I want an employer, EPFO, or bank package addressed to the right owner, so that the receiver can act without re-diagnosing the case.
10. As a member, I want every package and receipt labelled simulated and not submitted, so that I never mistake a prototype artifact for an external action.
11. As a member, I want to see tracking status and status history, so that I know what is waiting and what happens next.
12. As a member, I want waiting to be a valid terminal state, so that I am not forced to take an unsafe or unnecessary action.
13. As a member, I want to re-check after correction or handoff, so that the system can show resolved, same blocker, or new blocker without losing prior history.
14. As a member, I want a new blocker to be shown as a new diagnosis, so that I do not confuse it with the previous issue.
15. As a member, I want the flow to survive reload and resume from saved state, so that progress is not lost.
16. As a member, I want loading, empty, error with retry, refusal, wait, and data states to be understandable, so that every path has a safe next step.
17. As a member, I want the experience to work at 390px and 1280px, so that the same golden flows are usable on phone and desktop.
18. As an integration driver, I want a validated provider adapter seam, so that Varun's diagnosis provider can replace fixtures without rewriting resolution UI or business logic.
19. As an operator, I want B writes confined to B-owned tables, so that resolution cannot mutate diagnosis records.
20. As an operator, I want no PII in logs or synthetic artifacts, so that fixture verification remains safe.
21. As an integration driver, I want deterministic migration and seed verification, so that the prototype can be reproduced before integration.
22. As a reviewer, I want executable golden-flow verification, so that green unit tests cannot hide missing UI or persistence behavior.

## Implementation Decisions

- Use the existing frozen B-owned tables for proposed changes, simulations, resolution actions, handoffs, case artifacts, and case status events.
- Add one server-side Drizzle database adapter and keep domain services independent of the database through a persistence interface. The in-memory store remains a test double only.
- Use database transactions for action plus status-event writes and handoff/artifact plus status-event writes. Enforce idempotency at the database boundary and return the original record for duplicate keys.
- Keep fixture mode behind the existing diagnosis provider interface. A future real provider must return the same validated `DiagnosisResult`; no resolution code may inspect rejection taxonomy to derive a verdict, owner, blocker, or Mool.
- Align public routes with the blueprint contract under `/api/rescue-cases/:caseId/...`. Preserve a temporary compatibility adapter for the current `/api/resolution/:caseId/...` callers only if it does not duplicate business logic.
- Validate route params, request bodies, diagnosis input, and response payloads with Zod. Return the shared `{ data }` and `{ error: { code, message, retryable, requestId } }` envelopes.
- Require `Idempotency-Key` for every state-changing route. Require explicit approved consent for actions and handoffs. Unsupported, uncertain, or missing-verdict results cannot create consequential actions.
- Keep receipt content as stable JSON/HTML payload in P0. No image renderer or real sharing channel is required.
- Model the UI as a persisted case journey: summary, simulation, consent, action/artifact, receipt/tracking, re-check outcome, resolved/repeated/new blocker, wait, and refusal. Use `docs/DESIGN.md` as the only frontend authority and `lucide-react` only.
- Use the four golden fixtures to make deterministic re-check sequences: Fix resolves, Fight repeats, Forward produces a new blocker, and Unsupported refuses.
- Add a provider-swap contract test and executable smoke coverage for Fight receipt/tracking, Forward handoff/tracking, Fix simulation/re-check, and Unsupported refusal.

## Testing Decisions

- Test public domain and service seams with independent literal expectations, never by recomputing the implementation's output.
- Test route handlers through request/response boundaries, including malformed input, missing idempotency, unsupported diagnosis, retryable artifact failure, duplicate requests, and shared error envelopes.
- Test database persistence through the repository/service interface and transaction behavior using the configured local Postgres path when available; keep pure service tests fast with an explicit test adapter.
- Test re-check outcomes, version changes, history preservation, idempotent repeats, and reload/resume through public case APIs.
- Test UI behavior through the highest practical seam, covering all four golden journeys and all required states. Verify the simulation route is actually used by the Fix journey.
- Run `pnpm check`, `pnpm test`, `pnpm preflight`, `pnpm db:migrate`, `pnpm build`, and `git diff --check`. Record any unavailable external Supabase/Vercel step rather than pretending it passed.

## Out of Scope

- Real EPFO, employer, or bank submission.
- Authentication and authorization before real member data exists.
- Email, messaging, background jobs, realtime updates, payments, and production deployment.
- Changes to A-owned diagnosis tables, shared diagnosis contract, frozen migration semantics, root layout, or global UI tokens unless an integration contract requires a separately documented adapter.
- New statutory rules or diagnosis logic.

## Further Notes

The implementation follows the Harshit session playbook in order and closes the missing B4, B5, and B6 gates. The only unresolved external dependency is Varun's live provider; fixture mode remains the verified default and the provider interface is the I1 seam.
