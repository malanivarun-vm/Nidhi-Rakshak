import { getClaimCase } from "../../../../src/features/claim-intelligence/api";
import {
  isRouteResponse,
  requireCaseId,
  unavailableCaseRoute,
} from "../../../../src/features/claim-intelligence/route-helpers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ caseId: string }> },
) {
  const caseId = await requireCaseId(context);
  if (isRouteResponse(caseId)) return caseId;

  const data = await getClaimCase(caseId);
  if (!data) return unavailableCaseRoute("RESCUE_CASE_NOT_FOUND");
  return Response.json({
    data: {
      case: {
        caseId,
        status: data.diagnosis.status,
        diagnosis: data.diagnosis,
      },
    },
  });
}
