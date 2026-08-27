import { describe, expect, it } from "vitest";
import { DiagnosisResult } from "../../domain/contracts";
import {
  GOLDEN_FIGHT_RELATION_NAME,
  GOLDEN_FIX_BANK,
  GOLDEN_FORWARD_EXIT_DATE,
  GOLDEN_UNSUPPORTED,
} from "../../domain/golden-fixtures";
import type { ClaimContext } from "./claim-context";
import { runDiagnosis } from "./diagnosis-pipeline";
import {
  DiagnosisAlreadyExistsError,
  type DiagnosisRunRepository,
  type DiagnosisRunStore,
  persistDiagnosisVersion,
} from "./diagnosis-repository";
import { diagnoseCase } from "./diagnosis-service";
import type { RecordSnapshot } from "./record-comparison";

type GoldenFixture =
  | typeof GOLDEN_FIGHT_RELATION_NAME
  | typeof GOLDEN_FORWARD_EXIT_DATE
  | typeof GOLDEN_FIX_BANK
  | typeof GOLDEN_UNSUPPORTED;

function contextFor(fixture: GoldenFixture): ClaimContext {
  const evidence = fixture.evidence.map((item) => ({
    ...item,
    ...(item.source === "current_identity_records"
      ? {
          assertionKey: "current_relation_name",
          assertionValue: "RAMESH",
        }
      : {}),
  }));

  return {
    caseId: fixture.caseId,
    claim: {
      claimId: "11111111-1111-4111-8111-111111111111",
      externalRef: fixture.caseId,
      claimType: "WITHDRAWAL",
      submittedAt: "2026-08-27T00:00:00.000Z",
    },
    rejection: {
      rejectionId: "22222222-2222-4222-8222-222222222222",
      code: fixture.rejectionCode,
      rawText: fixture.rejectionCode,
    },
    evidence,
  };
}

function snapshotsFor(fixture: GoldenFixture): RecordSnapshot[] {
  if (fixture.rejectionCode === "RELATION_NAME_MISMATCH")
    return [
      {
        source: "current_identity_records",
        label: "Current identity records",
        capturedAt: "2026-08-27T00:00:00.000Z",
        observations: [
          {
            field: "relation_name",
            value: "RAMESH",
            label: "Current relation name",
            state: "VERIFIED",
            reference: true,
          },
        ],
        timelineEvents: [],
      },
      {
        source: "member_id_2019",
        label: "2019 PF record",
        capturedAt: "2026-08-27T00:00:00.000Z",
        observations: [
          {
            field: "relation_name",
            value: "RAMESH KUMAR",
            label: "Historical relation name",
            state: "VERIFIED",
            effectiveOn: "2019-06-01",
          },
        ],
        timelineEvents: [],
      },
    ];

  if (fixture.rejectionCode === "EXIT_DATE_MISSING")
    return [
      {
        source: "service_history",
        label: "Previous employment",
        capturedAt: "2026-08-27T00:00:00.000Z",
        observations: [
          {
            field: "date_of_exit",
            value: null,
            label: "Last working day",
            state: "VERIFIED",
          },
          {
            field: "mark_exit_eligible",
            value: "false",
            label: "Mark Exit eligibility",
            state: "VERIFIED",
          },
        ],
        timelineEvents: [],
      },
    ];

  if (fixture.rejectionCode === "BANK_DETAILS_INVALID")
    return [
      {
        source: "claim_context",
        label: "Claim bank value",
        capturedAt: "2026-08-27T00:00:00.000Z",
        observations: [
          {
            field: "bank_account_number",
            value: "1234",
            label: "Stored account number",
            state: "VERIFIED",
          },
        ],
        timelineEvents: [],
      },
      {
        source: "member_confirmation",
        label: "Confirmed account value",
        capturedAt: "2026-08-27T00:00:00.000Z",
        observations: [
          {
            field: "bank_account_number",
            value: "5678",
            label: "Confirmed account number",
            state: "VERIFIED",
            reference: true,
          },
        ],
        timelineEvents: [],
      },
    ];

  return [];
}

function runGolden(fixture: GoldenFixture) {
  return runDiagnosis({
    caseId: fixture.caseId,
    diagnosisId: fixture.diagnosisId,
    context: contextFor(fixture),
    snapshots: snapshotsFor(fixture),
  });
}

function createMemoryRepository(): {
  repository: DiagnosisRunRepository;
  rows: Array<{
    result: unknown;
    blockers: unknown;
    idempotencyKey: string;
  }>;
} {
  const rows: Array<{
    result: unknown;
    blockers: unknown;
    idempotencyKey: string;
  }> = [];
  const store: DiagnosisRunStore = {
    async findByIdempotencyKey({ caseId, idempotencyKey }) {
      return (
        rows.find(
          (row) =>
            row.idempotencyKey === idempotencyKey &&
            DiagnosisResult.parse(row.result).caseId === caseId,
        ) ?? null
      );
    },
    async findLatestByCaseId(caseId) {
      return (
        rows
          .filter((row) => DiagnosisResult.parse(row.result).caseId === caseId)
          .sort(
            (left, right) =>
              DiagnosisResult.parse(right.result).version -
              DiagnosisResult.parse(left.result).version,
          )[0] ?? null
      );
    },
    async append(input) {
      rows.push(input);
      return input;
    },
  };

  return {
    repository: {
      async transaction(work) {
        return work(store);
      },
    },
    rows,
  };
}

describe("deterministic diagnosis pipeline", () => {
  it.each([
    GOLDEN_FIGHT_RELATION_NAME,
    GOLDEN_FORWARD_EXIT_DATE,
    GOLDEN_FIX_BANK,
    GOLDEN_UNSUPPORTED,
  ])(
    "matches the frozen golden output exactly for $rejectionCode",
    (fixture) => {
      const execution = runGolden(fixture);

      expect(DiagnosisResult.parse(execution.result)).toEqual(fixture);
      expect(JSON.parse(JSON.stringify(execution.result))).toEqual(fixture);
    },
  );

  it("omits a verdict when evidence is insufficient or contradictory", () => {
    const insufficient = contextFor(GOLDEN_FIX_BANK);
    insufficient.evidence = [];
    const contradictory = contextFor(GOLDEN_FIX_BANK);
    contradictory.evidence = [
      {
        evidenceId: "bank-1",
        source: "claim_context",
        label: "Claim bank value A",
        state: "VERIFIED",
        assertionKey: "claim_bank_account",
        assertionValue: "1234",
      },
      {
        evidenceId: "bank-2",
        source: "claim_context",
        label: "Claim bank value B",
        state: "VERIFIED",
        assertionKey: "claim_bank_account",
        assertionValue: "5678",
      },
      {
        evidenceId: "bank-3",
        source: "member_confirmation",
        label: "Confirmed account value",
        state: "VERIFIED",
      },
    ];

    for (const context of [insufficient, contradictory]) {
      const result = runDiagnosis({
        caseId: context.caseId,
        diagnosisId: "safe-no-verdict",
        context,
        snapshots: snapshotsFor(GOLDEN_FIX_BANK),
      }).result;
      expect(result.status).toBe("NEEDS_EVIDENCE");
      expect(result.verdict).toBeUndefined();
      expect(result.owner).toBe("NONE");
    }
  });

  it("marks unloaded declared record snapshots as unknown and withholds a verdict", () => {
    const fixture = GOLDEN_FIGHT_RELATION_NAME;
    const result = runDiagnosis({
      caseId: fixture.caseId,
      diagnosisId: "unknown-record-state",
      context: contextFor(fixture),
      snapshots: [],
    }).result;

    expect(result).toMatchObject({
      status: "NEEDS_EVIDENCE",
      evidenceState: "UNKNOWN",
      owner: "NONE",
    });
    expect(result.verdict).toBeUndefined();
  });

  it("selects the configured primary blocker while retaining additional divergent blockers for A-owned persistence", () => {
    const snapshots = snapshotsFor(GOLDEN_FIX_BANK);
    snapshots[0]?.observations.push({
      field: "ifsc",
      value: "ABCD0001234",
      label: "Stored IFSC",
      state: "VERIFIED",
    });
    snapshots[1]?.observations.push({
      field: "ifsc",
      value: "ABCD0005678",
      label: "Confirmed IFSC",
      state: "VERIFIED",
      reference: true,
    });

    const execution = runDiagnosis({
      caseId: GOLDEN_FIX_BANK.caseId,
      diagnosisId: GOLDEN_FIX_BANK.diagnosisId,
      context: contextFor(GOLDEN_FIX_BANK),
      snapshots,
    });

    expect(execution.result.blocker).toEqual(GOLDEN_FIX_BANK.blocker);
    expect(execution.blockers.map((blocker) => blocker.field)).toEqual([
      "bank_account_number",
      "ifsc",
    ]);
  });

  it("replays an idempotency key and appends version two only for an explicit re-check", async () => {
    const { repository, rows } = createMemoryRepository();
    const execution = runGolden(GOLDEN_FIX_BANK);

    const first = await persistDiagnosisVersion({
      caseId: execution.result.caseId,
      idempotencyKey: "diagnose-1",
      recheck: false,
      execution,
      repository,
    });
    const replay = await persistDiagnosisVersion({
      caseId: execution.result.caseId,
      idempotencyKey: "diagnose-1",
      recheck: false,
      execution,
      repository,
    });
    const recheck = await persistDiagnosisVersion({
      caseId: execution.result.caseId,
      idempotencyKey: "recheck-1",
      recheck: true,
      execution: {
        ...execution,
        result: { ...execution.result, diagnosisId: "diagnosis-bank-recheck" },
      },
      repository,
    });

    expect(replay).toEqual(first);
    expect(recheck.version).toBe(2);
    expect(
      rows.map((row) => DiagnosisResult.parse(row.result).version),
    ).toEqual([1, 2]);
    expect(DiagnosisResult.parse(rows[0]?.result)).toEqual(first);

    await expect(
      persistDiagnosisVersion({
        caseId: execution.result.caseId,
        idempotencyKey: "another-initial-request",
        recheck: false,
        execution,
        repository,
      }),
    ).rejects.toBeInstanceOf(DiagnosisAlreadyExistsError);
  });

  it("rejects malformed repository data instead of returning an unvalidated diagnosis", async () => {
    const execution = runGolden(GOLDEN_UNSUPPORTED);
    const repository: DiagnosisRunRepository = {
      async transaction(work) {
        return work({
          async findByIdempotencyKey() {
            return {
              result: { invalid: true },
              blockers: [],
              idempotencyKey: "x",
            };
          },
          async findLatestByCaseId() {
            return null;
          },
          async append(input) {
            return input;
          },
        });
      },
    };

    await expect(
      persistDiagnosisVersion({
        caseId: execution.result.caseId,
        idempotencyKey: "invalid-row",
        recheck: false,
        execution,
        repository,
      }),
    ).rejects.toThrow();
  });

  it("validates data at all repository seams before persisting a diagnosis", async () => {
    const { repository } = createMemoryRepository();
    const fixture = GOLDEN_FORWARD_EXIT_DATE;

    await expect(
      diagnoseCase({
        caseId: fixture.caseId,
        diagnosisId: fixture.diagnosisId,
        idempotencyKey: "diagnose-forward",
        claimContextRepository: {
          async findByCaseId() {
            return contextFor(fixture);
          },
          async findOrCreateByClaimId() {
            return null;
          },
        },
        recordSnapshotRepository: {
          async findByCaseId() {
            return snapshotsFor(fixture);
          },
        },
        diagnosisRunRepository: repository,
      }),
    ).resolves.toEqual(fixture);

    await expect(
      diagnoseCase({
        caseId: fixture.caseId,
        diagnosisId: "invalid-snapshots",
        idempotencyKey: "invalid-snapshots",
        recheck: true,
        claimContextRepository: {
          async findByCaseId() {
            return contextFor(fixture);
          },
          async findOrCreateByClaimId() {
            return null;
          },
        },
        recordSnapshotRepository: {
          async findByCaseId() {
            return [{ source: "missing-required-fields" }];
          },
        },
        diagnosisRunRepository: repository,
      }),
    ).rejects.toThrow();
  });
});
