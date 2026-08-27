import {
  claimIdSchema,
  createErrorResponse,
  createNotImplementedResponse,
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

  return createNotImplementedResponse("RESCUE_CONTEXT_NOT_READY");
}
