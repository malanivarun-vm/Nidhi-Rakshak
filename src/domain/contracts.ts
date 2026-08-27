import { z } from "zod";

export const JourneyType = z.enum([
  "MISMATCH",
  "MISSING_DATA",
  "VALIDATION_FAILURE",
  "SERVICE_HISTORY",
  "ELIGIBILITY",
  "RECORD_CONSOLIDATION",
  "PENDING_PROCESS",
  "UNSUPPORTED",
]);
export type JourneyType = z.infer<typeof JourneyType>;
export const Verdict = z.enum(["FIX", "FIGHT", "FORWARD", "NONE"]);
export type Verdict = z.infer<typeof Verdict>;
export const OwnerType = z.enum(["MEMBER", "EMPLOYER", "EPFO", "BANK", "NONE"]);
export type OwnerType = z.infer<typeof OwnerType>;
export const DiagnosisStatus = z.enum([
  "DIAGNOSED",
  "NEEDS_EVIDENCE",
  "UNSUPPORTED",
]);
export const EvidenceState = z.enum([
  "SUFFICIENT",
  "INSUFFICIENT",
  "CONTRADICTORY",
  "UNKNOWN",
]);
export const SupportStatus = z.enum([
  "GOLDEN",
  "SUPPORTED",
  "DECLARED_UNSUPPORTED",
]);
export const CaseStatus = z.enum([
  "OPEN",
  "DIAGNOSING",
  "DIAGNOSED",
  "IN_RESOLUTION",
  "WAITING",
  "RESOLVED",
  "REFUSED",
]);
export const RouteType = z.enum([
  "MEMBER_CORRECTION",
  "EPFO",
  "EMPLOYER",
  "BANK",
  "WAIT",
  "NONE",
]);

export const EvidenceSummary = z.object({
  evidenceId: z.string().min(1),
  source: z.string().min(1),
  label: z.string().min(1),
  state: z.enum(["VERIFIED", "INFERRED", "UNKNOWN"]),
  observedAt: z.string().datetime().optional(),
});

export const DiagnosisResult = z.object({
  contractVersion: z.literal("1"),
  caseId: z.string().min(1),
  diagnosisId: z.string().min(1),
  rejectionCode: z.string().min(1),
  journeyType: JourneyType,
  status: DiagnosisStatus,
  supportStatus: SupportStatus,
  problemSummary: z.string().min(1),
  blocker: z
    .object({
      type: z.string().min(1),
      field: z.string().optional(),
      reason: z.string().min(1),
    })
    .optional(),
  owner: OwnerType,
  verdict: Verdict.optional(),
  doNotTouch: z.object({ applies: z.boolean(), reason: z.string().optional() }),
  evidenceState: EvidenceState,
  evidence: z.array(EvidenceSummary),
  firstDivergence: z
    .object({ label: z.string(), source: z.string(), detail: z.string() })
    .optional(),
  falsifier: z.string().optional(),
  nextRouteType: RouteType,
  recommendedAction: z.string().min(1),
  version: z.number().int().positive(),
});
export type DiagnosisResult = z.infer<typeof DiagnosisResult>;

export const RescueCaseSummary = z.object({
  caseId: z.string().min(1),
  claimType: z.string().min(1),
  submittedAt: z.string().datetime(),
  status: CaseStatus,
  title: z.string().min(1),
  reason: z.string().min(1),
});
export type RescueCaseSummary = z.infer<typeof RescueCaseSummary>;

export const ErrorEnvelope = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean(),
    requestId: z.string(),
  }),
});
export type ErrorEnvelope = z.infer<typeof ErrorEnvelope>;
