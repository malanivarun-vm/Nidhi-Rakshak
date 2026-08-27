import type { z } from "zod";
import {
  type DiagnosisResult,
  DiagnosisResult as DiagnosisResultSchema,
  type OwnerType,
  type RouteType,
  type Verdict,
} from "../../domain/contracts";

type ResolutionRouteType = z.infer<typeof RouteType>;

export interface ResolutionTranslation {
  caseId: string;
  diagnosisId: string;
  headline: string;
  owner: { label: string; reason: string };
  route: { label: string; actionAvailable: boolean };
  recommendedAction: string;
  falsifier?: string;
  doNotTouch?: string;
}

const ownerLabels: Record<OwnerType, string> = {
  MEMBER: "You",
  EMPLOYER: "Your previous employer",
  EPFO: "EPFO",
  BANK: "Your bank",
  NONE: "No one",
};

const routeLabels: Record<ResolutionRouteType, string> = {
  MEMBER_CORRECTION: "Fix this detail",
  EPFO: "Resolve this with EPFO",
  EMPLOYER: "Send this to your employer",
  BANK: "Send this to your bank",
  WAIT: "Check again later",
  NONE: "No action needed",
};

const verdictHeadlines: Record<Exclude<Verdict, "FORWARD">, string> = {
  FIX: "One detail needs to be corrected.",
  FIGHT: "Your current details are correct. Don’t change them.",
  NONE: "We can’t safely tell you what to change yet.",
};

const refusalHeadline = "We can’t safely tell you what to change yet.";

const getOwnerReason = (diagnosis: DiagnosisResult): string => {
  if (diagnosis.verdict === "FORWARD")
    return diagnosis.blocker?.reason ?? diagnosis.problemSummary;
  if (diagnosis.verdict === "FIX")
    return "You can take the next correction step.";
  if (diagnosis.verdict === "FIGHT")
    return "Your current details should stay as they are.";
  return "There is no safe action available from the information we have.";
};

export const translateDiagnosis = (input: unknown): ResolutionTranslation => {
  const diagnosis = DiagnosisResultSchema.parse(input);
  const verdict = diagnosis.verdict;
  const actionable = diagnosis.status === "DIAGNOSED" && verdict !== undefined;
  const headline =
    !actionable || !verdict
      ? refusalHeadline
      : verdict === "FORWARD"
        ? `${ownerLabels[diagnosis.owner]} needs to fix this.`
        : verdictHeadlines[verdict];
  const routeType = actionable ? diagnosis.nextRouteType : "NONE";

  return {
    caseId: diagnosis.caseId,
    diagnosisId: diagnosis.diagnosisId,
    headline,
    owner: {
      label: actionable ? ownerLabels[diagnosis.owner] : "No one",
      reason: actionable
        ? getOwnerReason(diagnosis)
        : "We need more evidence before suggesting a consequential action.",
    },
    route: {
      label: routeLabels[routeType],
      actionAvailable:
        actionable && routeType !== "NONE" && routeType !== "WAIT",
    },
    recommendedAction: actionable
      ? diagnosis.recommendedAction
      : "Get help through the EPFO grievance route.",
    falsifier: actionable ? diagnosis.falsifier : undefined,
    doNotTouch: diagnosis.doNotTouch.applies
      ? diagnosis.doNotTouch.reason
      : undefined,
  };
};
