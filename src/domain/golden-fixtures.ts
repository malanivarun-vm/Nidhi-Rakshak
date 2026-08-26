import type { DiagnosisResult } from "./contracts";

const base = (
  input: Omit<DiagnosisResult, "contractVersion" | "version">,
): DiagnosisResult => ({ ...input, contractVersion: "1", version: 1 });

export const GOLDEN_FIGHT_RELATION_NAME = base({
  caseId: "case-golden-fight-relation-name",
  diagnosisId: "diagnosis-golden-fight-relation-name",
  rejectionCode: "RELATION_NAME_MISMATCH",
  journeyType: "MISMATCH",
  status: "DIAGNOSED",
  supportStatus: "GOLDEN",
  problemSummary: "An older PF record has a different relation name.",
  blocker: {
    type: "RECORD_MISMATCH",
    field: "relation_name",
    reason: "The historical record differs from the current identity records.",
  },
  owner: "EPFO",
  verdict: "FIGHT",
  doNotTouch: {
    applies: true,
    reason:
      "Your current identity details agree across the records we checked.",
  },
  evidenceState: "SUFFICIENT",
  evidence: [
    {
      evidenceId: "evidence-fight-current",
      source: "current_identity_records",
      label: "Current identity records agree",
      state: "VERIFIED",
    },
    {
      evidenceId: "evidence-fight-history",
      source: "member_id_2019",
      label: "2019 PF record differs",
      state: "VERIFIED",
    },
  ],
  firstDivergence: {
    label: "2019 PF record",
    source: "member_id_2019",
    detail: "This is the first observable record where the values diverge.",
  },
  falsifier:
    "A 2019 payslip or appointment letter showing the other spelling would change this diagnosis.",
  nextRouteType: "EPFO",
  recommendedAction: "Keep your current details and resolve this with EPFO.",
});

export const GOLDEN_FORWARD_EXIT_DATE = base({
  caseId: "case-golden-forward-exit-date",
  diagnosisId: "diagnosis-golden-forward-exit-date",
  rejectionCode: "EXIT_DATE_MISSING",
  journeyType: "MISSING_DATA",
  status: "DIAGNOSED",
  supportStatus: "GOLDEN",
  problemSummary: "Your last working day is missing from your PF record.",
  blocker: {
    type: "MISSING_FIELD",
    field: "date_of_exit",
    reason: "The previous employer has not recorded the exit date.",
  },
  owner: "EMPLOYER",
  verdict: "FORWARD",
  doNotTouch: { applies: false },
  evidenceState: "SUFFICIENT",
  evidence: [
    {
      evidenceId: "evidence-exit-history",
      source: "service_history",
      label: "Previous employer record has no exit date",
      state: "VERIFIED",
    },
  ],
  falsifier:
    "An updated service record showing a recorded exit date would change this diagnosis.",
  nextRouteType: "EMPLOYER",
  recommendedAction:
    "Ask your previous employer to update your last working day.",
});

export const GOLDEN_FIX_BANK = base({
  caseId: "case-golden-fix-bank",
  diagnosisId: "diagnosis-golden-fix-bank",
  rejectionCode: "BANK_DETAILS_INVALID",
  journeyType: "VALIDATION_FAILURE",
  status: "DIAGNOSED",
  supportStatus: "GOLDEN",
  problemSummary: "One bank detail does not match the account evidence.",
  blocker: {
    type: "FIELD_MISMATCH",
    field: "bank_account_number",
    reason:
      "The account number stored for the claim differs from the confirmed account value.",
  },
  owner: "MEMBER",
  verdict: "FIX",
  doNotTouch: { applies: false },
  evidenceState: "SUFFICIENT",
  evidence: [
    {
      evidenceId: "evidence-bank-claim",
      source: "claim_context",
      label: "Claim bank value",
      state: "VERIFIED",
    },
    {
      evidenceId: "evidence-bank-confirmed",
      source: "member_confirmation",
      label: "Confirmed account value",
      state: "VERIFIED",
    },
  ],
  falsifier:
    "A bank record confirming the currently stored value would change this diagnosis.",
  nextRouteType: "MEMBER_CORRECTION",
  recommendedAction: "Correct this bank detail through the EPFO KYC route.",
});

export const GOLDEN_UNSUPPORTED = base({
  caseId: "case-golden-unsupported",
  diagnosisId: "diagnosis-golden-unsupported",
  rejectionCode: "UNMAPPED_REJECTION",
  journeyType: "UNSUPPORTED",
  status: "UNSUPPORTED",
  supportStatus: "GOLDEN",
  problemSummary: "We cannot safely diagnose this rejection yet.",
  owner: "NONE",
  doNotTouch: { applies: false },
  evidenceState: "UNKNOWN",
  evidence: [],
  nextRouteType: "EPFO",
  recommendedAction: "Get help through the EPFO grievance route.",
});

export const GOLDEN_FIXTURES = {
  GOLDEN_FIGHT_RELATION_NAME,
  GOLDEN_FORWARD_EXIT_DATE,
  GOLDEN_FIX_BANK,
  GOLDEN_UNSUPPORTED,
} as const;
