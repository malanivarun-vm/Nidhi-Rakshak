import { describe, expect, it } from "vitest";
import type { DecodedClaimContextResult } from "./claim-context";
import { determineOwnership } from "./ownership";
import {
  type RecordSnapshot,
  compareRelevantRecords,
  deriveMool,
} from "./record-comparison";
import { getRejectionContract } from "./rejection-registry";
import { deriveServiceTimeline } from "./service-timeline";

function supportedContext(
  code: string,
  evidenceState: "SUFFICIENT" | "INSUFFICIENT" | "CONTRADICTORY" = "SUFFICIENT",
): DecodedClaimContextResult {
  const contract = getRejectionContract(code);
  if (contract === null) throw new Error(`Missing test contract: ${code}`);

  return {
    kind: "AVAILABLE",
    context: {
      caseId: "case-a3",
      claim: {
        claimId: "11111111-1111-4111-8111-111111111111",
        externalRef: "claim-a3",
        claimType: "WITHDRAWAL",
        submittedAt: "2026-08-27T00:00:00.000Z",
      },
      rejection: {
        rejectionId: "22222222-2222-4222-8222-222222222222",
        code,
        rawText: code,
      },
      evidence: [],
    },
    decoding: { status: "SUPPORTED", contract },
    evidence: {
      state: evidenceState,
      missing: evidenceState === "INSUFFICIENT" ? ["required_source"] : [],
      contradictions:
        evidenceState === "CONTRADICTORY" ? ["relation_name"] : [],
    },
  };
}

const unsupportedContext: DecodedClaimContextResult = {
  kind: "AVAILABLE",
  context: {
    caseId: "case-unsupported",
    claim: {
      claimId: "11111111-1111-4111-8111-111111111111",
      externalRef: "claim-unsupported",
      claimType: "WITHDRAWAL",
      submittedAt: "2026-08-27T00:00:00.000Z",
    },
    rejection: {
      rejectionId: "22222222-2222-4222-8222-222222222222",
      code: null,
      rawText: "Unrecognised rejection",
    },
    evidence: [],
  },
  decoding: { status: "UNSUPPORTED", contract: null },
  evidence: { state: "UNKNOWN", missing: [], contradictions: [] },
};

function snapshot(input: RecordSnapshot): RecordSnapshot {
  return input;
}

describe("Claim Intelligence record comparison primitives", () => {
  it("compares only contract-declared Fight records and identifies the first observable divergence without assigning blame", () => {
    const comparison = compareRelevantRecords({
      context: supportedContext("RELATION_NAME_MISMATCH"),
      snapshots: [
        snapshot({
          source: "current_identity_records",
          label: "Current identity records",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: "RAMESH",
              label: "Father's name",
              state: "VERIFIED",
              reference: true,
            },
          ],
          timelineEvents: [],
        }),
        snapshot({
          source: "member_id_2019",
          label: "2019 PF record",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: "RAMESH KUMAR",
              label: "Father's name",
              state: "VERIFIED",
              effectiveOn: "2019-06-01",
            },
          ],
          timelineEvents: [],
        }),
        snapshot({
          source: "unrelated_bank_record",
          label: "Unrelated bank record",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "bank_account_number",
              value: "1234",
              label: "Account number",
              state: "VERIFIED",
            },
          ],
          timelineEvents: [],
        }),
      ],
    });

    expect(comparison).toMatchObject({
      state: "READY",
      includedSources: ["current_identity_records", "member_id_2019"],
      excludedSources: ["unrelated_bank_record"],
      fields: [
        {
          field: "relation_name",
          state: "DIVERGENT",
          evidenceSources: ["current_identity_records", "member_id_2019"],
        },
      ],
    });

    expect(deriveMool(comparison)).toEqual({
      state: "AVAILABLE",
      firstDivergence: {
        label: "2019 PF record",
        source: "member_id_2019",
        detail:
          "The verified relation_name value differs from the verified reference records.",
      },
    });
    expect(determineOwnership(comparison)).toMatchObject({
      state: "DETERMINED",
      owner: "EPFO",
      evidenceSources: ["current_identity_records", "member_id_2019"],
    });
  });

  it("derives a stable Forward service timeline and employer ownership only when the safe branch is evidenced", () => {
    const comparison = compareRelevantRecords({
      context: supportedContext("EXIT_DATE_MISSING"),
      snapshots: [
        snapshot({
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
          timelineEvents: [
            {
              occurredOn: "2019-06-01",
              label: "Joined previous employer",
              state: "VERIFIED",
            },
            {
              occurredOn: "2026-06-30",
              label: "Last PF contribution received",
              state: "VERIFIED",
            },
          ],
        }),
      ],
    });

    expect(deriveServiceTimeline(comparison)).toEqual({
      state: "AVAILABLE",
      events: [
        {
          occurredOn: "2019-06-01",
          label: "Joined previous employer",
          source: "service_history",
          state: "VERIFIED",
        },
        {
          occurredOn: "2026-06-30",
          label: "Last PF contribution received",
          source: "service_history",
          state: "VERIFIED",
        },
      ],
    });
    expect(determineOwnership(comparison)).toMatchObject({
      state: "DETERMINED",
      owner: "EMPLOYER",
      evidenceSources: ["service_history"],
    });
  });

  it("identifies a Fix bank divergence while retaining inferred evidence as non-decisive provenance", () => {
    const comparison = compareRelevantRecords({
      context: supportedContext("BANK_DETAILS_INVALID"),
      snapshots: [
        snapshot({
          source: "claim_context",
          label: "Claim bank value",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "bank_account_number",
              value: "1234",
              label: "Account number",
              state: "VERIFIED",
            },
            {
              field: "ifsc",
              value: "ABCD0001234",
              label: "IFSC",
              state: "INFERRED",
            },
          ],
          timelineEvents: [],
        }),
        snapshot({
          source: "member_confirmation",
          label: "Confirmed account value",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "bank_account_number",
              value: "5678",
              label: "Account number",
              state: "VERIFIED",
              reference: true,
            },
          ],
          timelineEvents: [],
        }),
      ],
    });

    expect(comparison.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "bank_account_number",
          state: "DIVERGENT",
        }),
        expect.objectContaining({ field: "ifsc", state: "INSUFFICIENT" }),
      ]),
    );
    expect(determineOwnership(comparison)).toMatchObject({
      state: "DETERMINED",
      owner: "MEMBER",
      evidenceSources: ["claim_context", "member_confirmation"],
    });
  });

  it("keeps matching verified records distinct from a single observed record", () => {
    const comparison = compareRelevantRecords({
      context: supportedContext("RELATION_NAME_MISMATCH"),
      snapshots: [
        snapshot({
          source: "current_identity_records",
          label: "Current identity records",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: "RAMESH",
              label: "Father's name",
              state: "VERIFIED",
              reference: true,
            },
          ],
          timelineEvents: [],
        }),
        snapshot({
          source: "member_id_2019",
          label: "2019 PF record",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: "RAMESH",
              label: "Father's name",
              state: "VERIFIED",
            },
          ],
          timelineEvents: [],
        }),
      ],
    });

    expect(comparison).toMatchObject({
      state: "READY",
      fields: [{ field: "relation_name", state: "MATCH" }],
    });
    expect(deriveMool(comparison)).toEqual({ state: "UNAVAILABLE" });
  });

  it("treats a verified missing value as a relevant divergence from a verified value", () => {
    const comparison = compareRelevantRecords({
      context: supportedContext("RELATION_NAME_MISMATCH"),
      snapshots: [
        snapshot({
          source: "current_identity_records",
          label: "Current identity records",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: "RAMESH",
              label: "Father's name",
              state: "VERIFIED",
              reference: true,
            },
          ],
          timelineEvents: [],
        }),
        snapshot({
          source: "member_id_2019",
          label: "2019 PF record",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: null,
              label: "Father's name",
              state: "VERIFIED",
            },
          ],
          timelineEvents: [],
        }),
      ],
    });

    expect(comparison).toMatchObject({
      state: "READY",
      fields: [{ field: "relation_name", state: "DIVERGENT" }],
    });
  });

  it("returns inspectable safe intermediates for insufficient, contradictory, unknown, and unsupported contexts", () => {
    expect(
      compareRelevantRecords({
        context: supportedContext("RELATION_NAME_MISMATCH", "INSUFFICIENT"),
        snapshots: [],
      }),
    ).toEqual({
      state: "INSUFFICIENT",
      includedSources: [],
      excludedSources: [],
      fields: [],
      evidenceState: "INSUFFICIENT",
    });
    expect(
      compareRelevantRecords({
        context: supportedContext("RELATION_NAME_MISMATCH", "CONTRADICTORY"),
        snapshots: [],
      }),
    ).toMatchObject({ state: "CONTRADICTORY", evidenceState: "CONTRADICTORY" });
    expect(
      compareRelevantRecords({
        context: supportedContext("RELATION_NAME_MISMATCH"),
        snapshots: [],
      }),
    ).toMatchObject({
      state: "UNKNOWN",
      requiredSources: ["current_identity_records", "member_id_2019"],
    });
    expect(
      compareRelevantRecords({ context: unsupportedContext, snapshots: [] }),
    ).toEqual({
      state: "UNSUPPORTED",
      includedSources: [],
      excludedSources: [],
      fields: [],
      evidenceState: "UNKNOWN",
    });
  });

  it("does not treat internally conflicting verified snapshots as a comparison", () => {
    const comparison = compareRelevantRecords({
      context: supportedContext("RELATION_NAME_MISMATCH"),
      snapshots: [
        snapshot({
          source: "current_identity_records",
          label: "Current identity records",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: "RAMESH",
              label: "Father's name",
              state: "VERIFIED",
              reference: true,
            },
          ],
          timelineEvents: [],
        }),
        snapshot({
          source: "member_id_2019",
          label: "2019 PF record",
          capturedAt: "2026-08-27T00:00:00.000Z",
          observations: [
            {
              field: "relation_name",
              value: "RAMESH KUMAR",
              label: "Father's name",
              state: "VERIFIED",
            },
            {
              field: "relation_name",
              value: "SURESH KUMAR",
              label: "Father's name",
              state: "VERIFIED",
            },
          ],
          timelineEvents: [],
        }),
      ],
    });

    expect(comparison).toMatchObject({
      state: "CONTRADICTORY",
      evidenceState: "CONTRADICTORY",
    });
  });
});
