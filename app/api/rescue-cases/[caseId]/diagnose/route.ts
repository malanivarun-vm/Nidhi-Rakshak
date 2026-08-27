import { diagnoseClaimCase } from "../../../../../src/features/claim-intelligence/api";
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

  const diagnosis = await diagnoseClaimCase(
    caseId,
    request.headers.get("idempotency-key") as string,
  );
  if (!diagnosis) return unavailableCaseRoute("DIAGNOSIS_NOT_FOUND");
  return Response.json({ data: diagnosis });
}
