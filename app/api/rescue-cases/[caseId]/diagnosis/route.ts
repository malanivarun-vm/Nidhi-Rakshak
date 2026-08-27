import type { DiagnosisResult as DiagnosisResultType } from "../../../../../src/domain/contracts";
import { createDiagnosisApiProvider } from "../../../../../src/features/claim-intelligence/diagnosis-api-provider";
import { createErrorResponse } from "../../../../../src/features/claim-intelligence/http";
import {
  isRouteResponse,
  requireCaseId,
} from "../../../../../src/features/claim-intelligence/route-helpers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ caseId: string }> },
) {
  const caseId = await requireCaseId(context);
  if (isRouteResponse(caseId)) return caseId;

  const provider = createDiagnosisApiProvider();
  if (provider === null)
    return createErrorResponse({
      code: "DIAGNOSIS_PROVIDER_UNAVAILABLE",
      message: "Diagnosis is temporarily unavailable. Please try again.",
      retryable: true,
      status: 503,
    });

  let diagnosis: DiagnosisResultType | null;
  try {
    diagnosis = await provider.getByCaseId(caseId);
  } catch {
    return createErrorResponse({
      code: "DIAGNOSIS_PROVIDER_UNAVAILABLE",
      message: "Diagnosis is temporarily unavailable. Please try again.",
      retryable: true,
      status: 503,
    });
  }
  if (diagnosis === null)
    return createErrorResponse({
      code: "DIAGNOSIS_NOT_FOUND",
      message: "This claim does not have a diagnosis yet.",
      retryable: false,
      status: 404,
    });

  return Response.json(
    { data: diagnosis },
    { headers: { "Cache-Control": "no-store" } },
  );
}
