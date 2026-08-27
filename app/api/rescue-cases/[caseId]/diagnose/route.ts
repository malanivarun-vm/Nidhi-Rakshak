import { requireIdempotencyKey } from "../../../../../src/features/claim-intelligence/http";
import {
  isRouteResponse,
  requireCaseId,
  unavailableCaseRoute,
} from "../../../../../src/features/claim-intelligence/route-helpers";

export async function POST(
  request: Request,
  context: { params: Promise<{ caseId: string }> },
) {
  const caseId = await requireCaseId(context);
  if (isRouteResponse(caseId)) return caseId;

  const idempotencyError = requireIdempotencyKey(request);
  if (idempotencyError) return idempotencyError;

  return unavailableCaseRoute("DIAGNOSIS_NOT_READY");
}
