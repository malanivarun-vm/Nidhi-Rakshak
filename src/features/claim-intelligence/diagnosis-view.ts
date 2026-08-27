import type { DiagnosisResult } from "../../domain/contracts";

export type DiagnosisView = {
  heading: string;
  actionLabel: string;
  ownerHeading: string;
  ownerReason: string;
  correctionRoute?: string;
  isRefusal: boolean;
  needsEvidence: boolean;
};

const ownerCopy: Record<DiagnosisResult["owner"], string> = {
  MEMBER: "You need to fix this.",
  EMPLOYER: "Your previous employer needs to fix this.",
  EPFO: "EPFO needs to review this.",
  BANK: "Your bank needs to verify this.",
  NONE: "You do not need to do anything right now.",
};

function headingFor(diagnosis: DiagnosisResult): string {
  if (diagnosis.status === "UNSUPPORTED")
    return "We can’t safely diagnose this rejection yet.";
  if (diagnosis.status === "NEEDS_EVIDENCE")
    return "We need one more record to be sure.";
  if (diagnosis.doNotTouch.applies)
    return "Your current details are correct. Don’t change them.";
  if (diagnosis.owner === "EMPLOYER")
    return "Your previous employer needs to fix this.";
  if (diagnosis.owner === "MEMBER") return "One detail needs to be corrected.";
  if (diagnosis.owner === "EPFO") return "EPFO needs to review this.";
  if (diagnosis.owner === "BANK") return "Your bank needs to verify this.";
  return "We found what needs attention.";
}

function actionLabelFor(diagnosis: DiagnosisResult): string {
  if (diagnosis.status === "UNSUPPORTED") return "Get help through EPFO";
  if (diagnosis.status === "NEEDS_EVIDENCE") return "Add the missing record";
  if (diagnosis.nextRouteType === "MEMBER_CORRECTION")
    return "Review where to correct it";
  return diagnosis.recommendedAction;
}

function correctionRouteFor(diagnosis: DiagnosisResult): string | undefined {
  if (diagnosis.nextRouteType !== "MEMBER_CORRECTION") return undefined;
  return "Use the EPFO KYC route to correct this bank detail. Review the confirmed account value before you make any change.";
}

/** Presentation-only mapping. It does not derive or alter a diagnosis verdict. */
export function toDiagnosisView(diagnosis: DiagnosisResult): DiagnosisView {
  return {
    heading: headingFor(diagnosis),
    actionLabel: actionLabelFor(diagnosis),
    ownerHeading: ownerCopy[diagnosis.owner],
    ownerReason:
      diagnosis.blocker?.reason ??
      "This is the safest next step based on the records we could verify.",
    ...(correctionRouteFor(diagnosis) === undefined
      ? {}
      : { correctionRoute: correctionRouteFor(diagnosis) }),
    isRefusal: diagnosis.status === "UNSUPPORTED",
    needsEvidence: diagnosis.status === "NEEDS_EVIDENCE",
  };
}
