import { getClaimCase } from "../../../../../src/features/claim-intelligence/api";
import {
  isRouteResponse,
  requireCaseId,
  unavailableCaseRoute,
} from "../../../../../src/features/claim-intelligence/route-helpers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ caseId: string }> },
) {
  const caseId = await requireCaseId(context);
  if (isRouteResponse(caseId)) return caseId;

  const data = await getClaimCase(caseId);
  if (!data) return unavailableCaseRoute("VERDICT_NOT_FOUND");
  return Response.json({
    data: {
      verdict: data.diagnosis.verdict,
      owner: data.diagnosis.owner,
      nextRouteType: data.diagnosis.nextRouteType,
    },
  });
}
