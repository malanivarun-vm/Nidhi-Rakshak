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
  if (!data) return unavailableCaseRoute("TIMELINE_NOT_FOUND");
  const divergence = data.diagnosis.firstDivergence;
  return Response.json({
    data: {
      timeline: divergence
        ? [
            {
              label: divergence.label,
              source: divergence.source,
              detail: divergence.detail,
            },
          ]
        : [],
    },
  });
}
