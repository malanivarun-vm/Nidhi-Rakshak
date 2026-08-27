import {
  createNotImplementedResponse,
  requireIdempotencyKey,
} from "../../../src/features/claim-intelligence/http";

export async function POST(request: Request) {
  const idempotencyError = requireIdempotencyKey(request);
  if (idempotencyError) return idempotencyError;

  return createNotImplementedResponse("RESCUE_CASE_CREATION_NOT_READY");
}
