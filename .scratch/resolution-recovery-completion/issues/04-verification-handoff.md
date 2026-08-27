# 04 — Run golden regression and prepare provider handoff

**What to build:** The resolution branch has repeatable verification evidence and exact I1 provider-swap instructions, with no protected-file drift, false external claims, PII logging, or unverified completion status.

**Blocked by:** 03 — Complete the four golden resolution journeys.

**Status:** ready-for-agent

- [ ] `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test`, `pnpm preflight`, `pnpm db:migrate`, and `pnpm build` pass.
- [ ] `git diff --check` and protected-file inspection pass.
- [ ] Fight receipt/tracking, Forward handoff/tracking, Fix simulation/re-check, and Unsupported refusal replay successfully.
- [ ] Provider swap instructions identify the single adapter seam and validated contract requirement.
- [ ] Final audit confirms no A-table writes, diagnosis recomputation, PII logs, or external-submission claims.
