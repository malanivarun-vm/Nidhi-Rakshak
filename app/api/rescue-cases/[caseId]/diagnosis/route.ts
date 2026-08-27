import { getFixtureDiagnosisForApi } from "../../../../../src/features/claim-intelligence/diagnosis-api-provider";
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

  if (process.env.NIDHI_FIXTURE_MODE !== "true")
    return createErrorResponse({
      code: "DIAGNOSIS_PROVIDER_UNAVAILABLE",
      message: "Diagnosis is temporarily unavailable. Please try again.",
      retryable: true,
      status: 503,
    });

  const diagnosis = await getFixtureDiagnosisForApi({ caseId });
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
