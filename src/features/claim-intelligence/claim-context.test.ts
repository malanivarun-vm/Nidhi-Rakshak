import { describe, expect, it } from "vitest";
import {
  type ClaimContext,
  type ClaimContextRepository,
  ClaimContextUnavailableError,
  createRescueCaseContext,
  loadDecodedClaimContext,
} from "./claim-context";

const context = (overrides: Partial<ClaimContext> = {}): ClaimContext => ({
  caseId: "case-1",
  claim: {
    claimId: "11111111-1111-4111-8111-111111111111",
    externalRef: "claim-1",
    claimType: "WITHDRAWAL",
    submittedAt: "2026-08-27T00:00:00.000Z",
  },
  rejection: {
    rejectionId: "22222222-2222-4222-8222-222222222222",
    code: "RELATION_NAME_MISMATCH",
    rawText: "RELATION_NAME_MISMATCH",
  },
  evidence: [
    {
      evidenceId: "identity-1",
      source: "current_identity_records",
      label: "Current identity records",
      state: "VERIFIED",
      assertionKey: "current_identity_relation_name",
      assertionValue: "RAMESH",
    },
    {
      evidenceId: "history-1",
      source: "member_id_2019",
      label: "2019 member ID record",
      state: "VERIFIED",
      assertionKey: "member_id_2019_relation_name",
      assertionValue: "RAMESH KUMAR",
    },
  ],
  ...overrides,
});

function repositoryFor(
  value: ClaimContext | null,
  options: { throws?: Error } = {},
): ClaimContextRepository {
  return {
    async findByCaseId() {
      if (options.throws) throw options.throws;
      return value;
    },
    async findOrCreateByClaimId() {
      if (options.throws) throw options.throws;
      return value;
    },
  };
}

describe("Claim Intelligence context", () => {
  it("loads the rejected claim context before decoding a known contract", async () => {
    const result = await loadDecodedClaimContext({
      caseId: "case-1",
      repository: repositoryFor(context()),
    });

    expect(result).toMatchObject({
      kind: "AVAILABLE",
      decoding: {
        status: "SUPPORTED",
        contract: { code: "RELATION_NAME_MISMATCH", journeyType: "MISMATCH" },
      },
      evidence: { state: "SUFFICIENT" },
    });
  });

  it("uses the explicit unsupported path for unmapped rejection text", async () => {
    const result = await loadDecodedClaimContext({
      caseId: "case-1",
      repository: repositoryFor(
        context({
          rejection: {
            rejectionId: "22222222-2222-4222-8222-222222222222",
            code: null,
            rawText: "A rejection phrase we do not recognise",
          },
        }),
      ),
    });

    expect(result).toMatchObject({
      kind: "AVAILABLE",
      decoding: { status: "UNSUPPORTED", contract: null },
      evidence: { state: "UNKNOWN" },
    });
  });

  it("does not diagnose a declared unsupported taxonomy code", async () => {
    const result = await loadDecodedClaimContext({
      caseId: "case-1",
      repository: repositoryFor(
        context({
          rejection: {
            rejectionId: "22222222-2222-4222-8222-222222222222",
            code: "MULTIPLE_UANS",
            rawText: "MULTIPLE_UANS",
          },
        }),
      ),
    });

    expect(result).toMatchObject({
      kind: "AVAILABLE",
      decoding: { status: "UNSUPPORTED", contract: null },
      evidence: { state: "UNKNOWN" },
    });
  });

  it("asks for only the missing declared evidence", async () => {
    const result = await loadDecodedClaimContext({
      caseId: "case-1",
      repository: repositoryFor(context({ evidence: [] })),
    });

    expect(result).toMatchObject({
      kind: "AVAILABLE",
      evidence: {
        state: "INSUFFICIENT",
        missing: ["current_identity_records", "member_id_2019"],
      },
    });
  });

  it("stops when two records make contradictory assertions", async () => {
    const result = await loadDecodedClaimContext({
      caseId: "case-1",
      repository: repositoryFor(
        context({
          evidence: [
            {
              evidenceId: "identity-1",
              source: "current_identity_records",
              label: "Identity record A",
              state: "VERIFIED",
              assertionKey: "identity_relation_name",
              assertionValue: "RAMESH",
            },
            {
              evidenceId: "identity-2",
              source: "current_identity_records",
              label: "Identity record B",
              state: "VERIFIED",
              assertionKey: "identity_relation_name",
              assertionValue: "SURESH",
            },
            {
              evidenceId: "history-1",
              source: "member_id_2019",
              label: "2019 member ID record",
              state: "VERIFIED",
            },
          ],
        }),
      ),
    });

    expect(result).toMatchObject({
      kind: "AVAILABLE",
      evidence: {
        state: "CONTRADICTORY",
        contradictions: ["identity_relation_name"],
      },
    });
  });

  it("preserves a retryable repository failure for the route layer", async () => {
    const result = await loadDecodedClaimContext({
      caseId: "case-1",
      repository: repositoryFor(null, {
        throws: new ClaimContextUnavailableError("database unavailable"),
      }),
    });

    expect(result).toEqual({
      kind: "RETRYABLE_ERROR",
      code: "CLAIM_CONTEXT_UNAVAILABLE",
    });
  });

  it("does not hide an unexpected repository failure as a retry", async () => {
    await expect(
      loadDecodedClaimContext({
        caseId: "case-1",
        repository: repositoryFor(null, {
          throws: new Error("unexpected repository failure"),
        }),
      }),
    ).rejects.toThrow("unexpected repository failure");
  });

  it("forwards the idempotency key when creating a case from an existing claim", async () => {
    const calls: Array<{ claimId: string; idempotencyKey: string }> = [];
    const repository: ClaimContextRepository = {
      async findByCaseId() {
        return null;
      },
      async findOrCreateByClaimId(input) {
        calls.push(input);
        return context();
      },
    };

    await createRescueCaseContext({
      claimId: "11111111-1111-4111-8111-111111111111",
      idempotencyKey: "create-case-1",
      repository,
    });

    expect(calls).toEqual([
      {
        claimId: "11111111-1111-4111-8111-111111111111",
        idempotencyKey: "create-case-1",
      },
    ]);
  });
});
