import { z } from "zod";
import {
  DiagnosisResult,
  type DiagnosisResult as DiagnosisResultType,
} from "../../domain/contracts";
import {
  GOLDEN_FIGHT_RELATION_NAME,
  GOLDEN_FIX_BANK,
  GOLDEN_FORWARD_EXIT_DATE,
  GOLDEN_UNSUPPORTED,
} from "../../domain/golden-fixtures";
import { ClaimContextSchema, decodeClaimContext } from "./claim-context";
import { determineOwnership } from "./ownership";
import {
  type RecordComparisonResult,
  RecordSnapshot,
  compareRelevantRecords,
  deriveMool,
} from "./record-comparison";

const diagnosisRequestSchema = z.object({
  caseId: z.string().trim().min(1).max(120),
  diagnosisId: z.string().trim().min(1).max(120),
  context: ClaimContextSchema,
  snapshots: z.array(RecordSnapshot),
});
export type DiagnosisRequest = z.input<typeof diagnosisRequestSchema>;

export const DiagnosisBlocker = z.object({
  type: z.string().min(1),
  field: z.string().min(1).optional(),
  reason: z.string().min(1),
  owner: z.enum(["MEMBER", "EMPLOYER", "EPFO", "BANK", "NONE"]),
});
export type DiagnosisBlocker = z.infer<typeof DiagnosisBlocker>;

export type DiagnosisExecution = {
  result: DiagnosisResultType;
  blockers: DiagnosisBlocker[];
};

type GoldenRule = Pick<
  DiagnosisResultType,
  | "problemSummary"
  | "blocker"
  | "doNotTouch"
  | "falsifier"
  | "firstDivergence"
  | "nextRouteType"
  | "recommendedAction"
> & {
  code: string;
  owner: DiagnosisResultType["owner"];
  verdict: NonNullable<DiagnosisResultType["verdict"]>;
  includeMool: boolean;
};

const goldenRules: readonly GoldenRule[] = [
  {
    code: "RELATION_NAME_MISMATCH",
    owner: "EPFO",
    verdict: "FIGHT",
    problemSummary: GOLDEN_FIGHT_RELATION_NAME.problemSummary,
    blocker: GOLDEN_FIGHT_RELATION_NAME.blocker,
    doNotTouch: GOLDEN_FIGHT_RELATION_NAME.doNotTouch,
    falsifier: GOLDEN_FIGHT_RELATION_NAME.falsifier,
    firstDivergence: GOLDEN_FIGHT_RELATION_NAME.firstDivergence,
    nextRouteType: GOLDEN_FIGHT_RELATION_NAME.nextRouteType,
    recommendedAction: GOLDEN_FIGHT_RELATION_NAME.recommendedAction,
    includeMool: true,
  },
  {
    code: "EXIT_DATE_MISSING",
    owner: "EMPLOYER",
    verdict: "FORWARD",
    problemSummary: GOLDEN_FORWARD_EXIT_DATE.problemSummary,
    blocker: GOLDEN_FORWARD_EXIT_DATE.blocker,
    doNotTouch: GOLDEN_FORWARD_EXIT_DATE.doNotTouch,
    falsifier: GOLDEN_FORWARD_EXIT_DATE.falsifier,
    firstDivergence: GOLDEN_FORWARD_EXIT_DATE.firstDivergence,
    nextRouteType: GOLDEN_FORWARD_EXIT_DATE.nextRouteType,
    recommendedAction: GOLDEN_FORWARD_EXIT_DATE.recommendedAction,
    includeMool: false,
  },
  {
    code: "BANK_DETAILS_INVALID",
    owner: "MEMBER",
    verdict: "FIX",
    problemSummary: GOLDEN_FIX_BANK.problemSummary,
    blocker: GOLDEN_FIX_BANK.blocker,
    doNotTouch: GOLDEN_FIX_BANK.doNotTouch,
    falsifier: GOLDEN_FIX_BANK.falsifier,
    firstDivergence: GOLDEN_FIX_BANK.firstDivergence,
    nextRouteType: GOLDEN_FIX_BANK.nextRouteType,
    recommendedAction: GOLDEN_FIX_BANK.recommendedAction,
    includeMool: false,
  },
];

function summaryEvidence(context: z.output<typeof ClaimContextSchema>) {
  return context.evidence
    .map(({ evidenceId, source, label, state, observedAt }) => ({
      evidenceId,
      source,
      label,
      state,
      ...(observedAt === undefined ? {} : { observedAt }),
    }))
    .sort(
      (left, right) =>
        left.source.localeCompare(right.source) ||
        left.evidenceId.localeCompare(right.evidenceId),
    );
}

function blockersFromComparison(
  comparison: RecordComparisonResult,
  owner: DiagnosisResultType["owner"],
): DiagnosisBlocker[] {
  if (comparison.state !== "READY") return [];

  return comparison.fields
    .filter((field) => field.state === "DIVERGENT")
    .map((field) =>
      DiagnosisBlocker.parse({
        type: "RECORD_MISMATCH",
        field: field.field,
        reason: "Verified records differ for this field.",
        owner,
      }),
    )
    .sort(
      (left, right) =>
        (left.field ?? "").localeCompare(right.field ?? "") ||
        left.type.localeCompare(right.type),
    );
}

function safeUnsupportedResult(input: {
  caseId: string;
  diagnosisId: string;
  rejectionCode: string;
}): DiagnosisExecution {
  return {
    result: DiagnosisResult.parse({
      ...GOLDEN_UNSUPPORTED,
      caseId: input.caseId,
      diagnosisId: input.diagnosisId,
      rejectionCode: input.rejectionCode,
    }),
    blockers: [],
  };
}

function needsEvidenceResult(input: {
  caseId: string;
  diagnosisId: string;
  rejectionCode: string;
  journeyType: DiagnosisResultType["journeyType"];
  supportStatus: DiagnosisResultType["supportStatus"];
  evidenceState: DiagnosisResultType["evidenceState"];
  evidence: DiagnosisResultType["evidence"];
  problemSummary: string;
}): DiagnosisExecution {
  return {
    result: DiagnosisResult.parse({
      contractVersion: "1",
      caseId: input.caseId,
      diagnosisId: input.diagnosisId,
      rejectionCode: input.rejectionCode,
      journeyType: input.journeyType,
      status: "NEEDS_EVIDENCE",
      supportStatus: input.supportStatus,
      problemSummary: input.problemSummary,
      owner: "NONE",
      doNotTouch: { applies: false },
      evidenceState: input.evidenceState,
      evidence: input.evidence,
      nextRouteType: "NONE",
      recommendedAction: "Get help with this claim.",
      version: 1,
    }),
    blockers: [],
  };
}

function safeComparisonEvidenceState(
  comparison: RecordComparisonResult,
): DiagnosisResultType["evidenceState"] {
  if (comparison.state === "CONTRADICTORY") return "CONTRADICTORY";
  if (comparison.state === "INSUFFICIENT") return "INSUFFICIENT";
  return "UNKNOWN";
}

/**
 * Executes deterministic Claim Intelligence only. Unsafe evidence, unmapped codes,
 * and conditions outside the verified golden rules intentionally omit a verdict.
 */
export function runDiagnosis(input: DiagnosisRequest): DiagnosisExecution {
  const request = diagnosisRequestSchema.parse(input);
  if (request.caseId !== request.context.caseId)
    throw new Error(
      "Diagnosis case ID must match the validated claim context.",
    );

  const context = decodeClaimContext(request.context);
  const rejectionCode =
    request.context.rejection.code?.trim().toUpperCase() ??
    "UNMAPPED_REJECTION";

  if (context.decoding.status === "UNSUPPORTED")
    return safeUnsupportedResult({
      caseId: request.caseId,
      diagnosisId: request.diagnosisId,
      rejectionCode,
    });

  const contract = context.decoding.contract;
  const evidence = summaryEvidence(request.context);
  if (context.evidence.state !== "SUFFICIENT")
    return needsEvidenceResult({
      caseId: request.caseId,
      diagnosisId: request.diagnosisId,
      rejectionCode: contract.code,
      journeyType: contract.journeyType,
      supportStatus: contract.prototypeSupport,
      evidenceState: context.evidence.state,
      evidence,
      problemSummary: contract.memberFacingReason,
    });

  const comparison = compareRelevantRecords({
    context,
    snapshots: request.snapshots,
  });
  const ownership = determineOwnership(comparison);
  const rule = goldenRules.find(
    (candidate) =>
      candidate.code === contract.code && candidate.owner === ownership.owner,
  );

  if (comparison.state !== "READY" || ownership.state !== "DETERMINED" || !rule)
    return needsEvidenceResult({
      caseId: request.caseId,
      diagnosisId: request.diagnosisId,
      rejectionCode: contract.code,
      journeyType: contract.journeyType,
      supportStatus: contract.prototypeSupport,
      evidenceState: safeComparisonEvidenceState(comparison),
      evidence,
      problemSummary: contract.memberFacingReason,
    });

  const mool = deriveMool(comparison);
  const blockers = blockersFromComparison(comparison, ownership.owner);
  const primary = rule.blocker;
  const orderedBlockers = primary
    ? [
        DiagnosisBlocker.parse({ ...primary, owner: ownership.owner }),
        ...blockers.filter((blocker) => blocker.field !== primary.field),
      ]
    : blockers;

  return {
    result: DiagnosisResult.parse({
      contractVersion: "1",
      caseId: request.caseId,
      diagnosisId: request.diagnosisId,
      rejectionCode: contract.code,
      journeyType: contract.journeyType,
      status: "DIAGNOSED",
      supportStatus: contract.prototypeSupport,
      problemSummary: rule.problemSummary,
      ...(primary === undefined ? {} : { blocker: primary }),
      owner: ownership.owner,
      verdict: rule.verdict,
      doNotTouch: rule.doNotTouch,
      evidenceState: "SUFFICIENT",
      evidence,
      ...(rule.includeMool && mool.state === "AVAILABLE"
        ? { firstDivergence: rule.firstDivergence }
        : {}),
      falsifier: rule.falsifier,
      nextRouteType: rule.nextRouteType,
      recommendedAction: rule.recommendedAction,
      version: 1,
    }),
    blockers: orderedBlockers,
  };
}
