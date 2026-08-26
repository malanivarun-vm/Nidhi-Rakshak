# Nidhi Rakshak — Parallel Build Handoff

## Prepared base

Base branch: `main`  
Prepared SHA: **the final `main` SHA printed in the preparation handoff**  
Read first: this file, `00-shared-integration-contract.md`, the relevant blueprint, PRD/journeys, and `docs/DESIGN.md`.

Deployment target: Vercel. Database target: Supabase Postgres. Obtain environment values from the project owner; do not add provider secrets to the repo.

## Developers

| Developer | Branch | Worktree | Blueprint |
|---|---|---|---|
| Varun — Claim Intelligence | `feat/claim-intelligence` | `../Nidhi-Rakshak-claim-intelligence` | `varun-implementation-guide.md` → `varun-session-playbook.md` → `varun-final-push.md` |
| Harshit — Resolution & Claim Recovery | `feat/resolution-recovery` | `../Nidhi-Rakshak-resolution-recovery` | `harshit-implementation-guide.md` → `harshit-session-playbook.md` → `harshit-final-push.md` |

Canonical execution artifacts:

- Varun: `varun-implementation-guide.md` → `varun-session-playbook.md` → `varun-final-push.md`
- Harshit: `harshit-implementation-guide.md` → `harshit-session-playbook.md` → `harshit-final-push.md`

## Starting commands

Separate machine:

```bash
git checkout main
git pull
git checkout -b feat/claim-intelligence <PREPARED_SHA>
# or: git checkout -b feat/resolution-recovery <PREPARED_SHA>
pnpm install --frozen-lockfile
pnpm preflight
```

Same machine:

```bash
git worktree add ../Nidhi-Rakshak-claim-intelligence -b feat/claim-intelligence <PREPARED_SHA>
git worktree add ../Nidhi-Rakshak-resolution-recovery -b feat/resolution-recovery <PREPARED_SHA>
```

## Protected boundaries

No casual edits to shared types, `src/db/schema.ts`, migrations, package files, root layout, global CSS, env schema, analytics bootstrap, seed infrastructure, or the other domain. A owns diagnosis; B consumes `DiagnosisResult` and owns resolution. `docs/DESIGN.md` is the sole UI/UX/frontend source of truth for both branches.

Frontend icon library: `lucide-react` only.

## Integration

Create `integration` only when the first feature is ready. Merge shared prepared base, A's diagnosis foundation, B's resolution domain, then connect B's fixture provider to A's validated provider.

- **I1 Contract integration:** real A `DiagnosisResult` validates unchanged through the shared schema and replaces B's fixture provider.
- **I2 Full golden loops:** Fight → EPFO receipt/tracking; Forward → employer artifact/tracking; Fix → simulation/re-check; Unsupported → refusal/no action.
- **I3 Ship gate:** fresh migration, deterministic seed/verify, contract/unit/integration/E2E, `pnpm check`, `pnpm build`, manual demo, then merge `integration` to `main`.

Rebase at session boundaries or before I1, not continuously. Integration driver resolves conflicts. A shared contract change stops both branches, updates version/docs/tests in a small integration commit, syncs both, and only then resumes.

## Forbidden shortcuts

No independent migrations, competing DiagnosisResult types, B-side verdict logic, A-side resolution writes, real PII, real external submissions, unverified statutory promises, or frontend decisions outside `docs/DESIGN.md`.
