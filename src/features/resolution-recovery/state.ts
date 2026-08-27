import type { DiagnosisResult } from "../../domain/contracts";

export type ResolutionState =
  | { status: "loading" }
  | { status: "data"; diagnosis: DiagnosisResult }
  | { status: "refusal"; diagnosis: DiagnosisResult }
  | { status: "empty" }
  | { status: "error"; message: string; retryable: boolean };

export const toResolutionState = (
  diagnosis: DiagnosisResult | undefined,
): ResolutionState => {
  if (!diagnosis) return { status: "empty" };
  if (diagnosis.status === "UNSUPPORTED")
    return { status: "refusal", diagnosis };

  return { status: "data", diagnosis };
};
