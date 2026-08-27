import {
  addClaimEvidence,
  getClaimCase,
} from "../../../../../src/features/claim-intelligence/api";
import { requireIdempotencyKey } from "../../../../../src/features/claim-intelligence/http";
import { createErrorResponse } from "../../../../../src/features/claim-intelligence/http";
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
  if (!data) return unavailableCaseRoute("EVIDENCE_NOT_FOUND");
  return Response.json({ data: { evidence: data.evidence } });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ caseId: string }> },
) {
  const caseId = await requireCaseId(context);
  if (isRouteResponse(caseId)) return caseId;

  const idempotencyError = requireIdempotencyKey(request);
  if (idempotencyError) return idempotencyError;

  const body = await request.json().catch(() => undefined);
  try {
    const evidence = await addClaimEvidence(
      caseId,
      request.headers.get("idempotency-key") as string,
      body,
    );
    if (!evidence) return unavailableCaseRoute("EVIDENCE_NOT_FOUND");
    return Response.json({ data: { evidence } });
  } catch {
    return createErrorResponse({
      code: "INVALID_EVIDENCE",
      message: "Evidence details are invalid.",
      retryable: false,
      status: 400,
    });
  }
}
