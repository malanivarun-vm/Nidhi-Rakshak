import type {
  ComparedField,
  ReadyRecordComparison,
  RecordComparisonResult,
} from "./record-comparison";

export type OwnershipResult =
  | {
      state: "DETERMINED";
      owner: "MEMBER" | "EMPLOYER" | "EPFO" | "BANK" | "NONE";
      evidenceSources: string[];
      rationale: string;
    }
  | {
      state: "UNDETERMINED";
      owner: "NONE";
      evidenceSources: [];
      rationale: string;
    };

function divergentField(
  comparison: ReadyRecordComparison,
  field: string,
): ComparedField | undefined {
  return comparison.fields.find(
    (candidate) => candidate.field === field && candidate.state === "DIVERGENT",
  );
}

function verifiedMissingField(
  comparison: ReadyRecordComparison,
  field: string,
): boolean {
  return comparison.fields.some((candidate) =>
    candidate.observations.some(
      (observation) =>
        observation.field === field &&
        observation.state === "VERIFIED" &&
        observation.value === null,
    ),
  );
}

function verifiedFalseField(
  comparison: ReadyRecordComparison,
  field: string,
): boolean {
  return comparison.fields.some((candidate) =>
    candidate.observations.some(
      (observation) =>
        observation.field === field &&
        observation.state === "VERIFIED" &&
        observation.value?.trim().toLocaleLowerCase("en-US") === "false",
    ),
  );
}

function undetermined(rationale: string): OwnershipResult {
  return {
    state: "UNDETERMINED",
    owner: "NONE",
    evidenceSources: [],
    rationale,
  };
}

/**
 * Establishes the actor that must act from explicitly observed conditions only.
 * This is intentionally not a verdict engine and never identifies who caused a
 * historical difference.
 */
export function determineOwnership(
  comparison: RecordComparisonResult,
): OwnershipResult {
  if (comparison.state !== "READY")
    return undetermined("Ownership requires a safe record comparison.");

  if (comparison.rejectionCode === "RELATION_NAME_MISMATCH") {
    const relationName = divergentField(comparison, "relation_name");
    const hasVerifiedReference = relationName?.observations.some(
      (observation) =>
        observation.reference && observation.state === "VERIFIED",
    );
    if (relationName !== undefined && hasVerifiedReference)
      return {
        state: "DETERMINED",
        owner: "EPFO",
        evidenceSources: relationName.evidenceSources,
        rationale:
          "Verified current reference records differ from the historical PF record; the member record is not selected for change.",
      };
    return undetermined(
      "A verified reference record is required for this mismatch.",
    );
  }

  if (comparison.rejectionCode === "EXIT_DATE_MISSING") {
    if (
      verifiedMissingField(comparison, "date_of_exit") &&
      verifiedFalseField(comparison, "mark_exit_eligible")
    )
      return {
        state: "DETERMINED",
        owner: "EMPLOYER",
        evidenceSources: ["service_history"],
        rationale:
          "The service record verifies a missing exit date and does not verify the self-service branch.",
      };
    return undetermined(
      "Employer ownership requires a verified missing exit date and an evidenced non-self-service branch.",
    );
  }

  if (comparison.rejectionCode === "BANK_DETAILS_INVALID") {
    const bankAccount = divergentField(comparison, "bank_account_number");
    if (bankAccount !== undefined)
      return {
        state: "DETERMINED",
        owner: "MEMBER",
        evidenceSources: bankAccount.evidenceSources,
        rationale:
          "The claim bank value differs from the verified confirmed account value.",
      };
    return undetermined("A verified bank-value divergence is required.");
  }

  return undetermined("This contract has no A3 ownership condition.");
}
