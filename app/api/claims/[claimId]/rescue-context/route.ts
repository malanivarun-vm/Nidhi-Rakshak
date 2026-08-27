import {
  fixtureCaseIds,
  getClaimCase,
  stableUuid,
} from "../../../../../src/features/claim-intelligence/api";
import {
  claimIdSchema,
  createErrorResponse,
} from "../../../../../src/features/claim-intelligence/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ claimId: string }> },
) {
  const { claimId } = await context.params;
  if (!claimIdSchema.safeParse(claimId).success)
    return createErrorResponse({
      code: "INVALID_CLAIM_ID",
      message: "A valid claim ID is required.",
      retryable: false,
      status: 400,
    });

  const caseId = fixtureCaseIds.find((id) => stableUuid(id) === claimId);
  const data = caseId ? await getClaimCase(caseId) : null;
  if (!data)
    return createErrorResponse({
      code: "RESCUE_CONTEXT_NOT_FOUND",
      message: "Claim context was not found.",
      retryable: false,
      status: 404,
    });
  return Response.json({ data: data.context });
}
