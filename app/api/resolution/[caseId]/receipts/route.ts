import { NextResponse } from "next/server";
import { getResolutionDiagnosis } from "../../../../../src/features/resolution-recovery/provider";
import { createReceipt } from "../../../../../src/features/resolution-recovery/recovery";

export const POST = async (
  request: Request,
  context: { params: Promise<{ caseId: string }> },
) => {
  const { caseId } = await context.params;
  const key = request.headers.get("Idempotency-Key");
  const diagnosis = await getResolutionDiagnosis(caseId);
  if (!key)
    return NextResponse.json(
      {
        error: {
          code: "IDEMPOTENCY_KEY_REQUIRED",
          message: "A receipt key is required.",
          retryable: false,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 400 },
    );
  if (!diagnosis)
    return NextResponse.json(
      {
        error: {
          code: "CASE_NOT_FOUND",
          message: "Case was not found.",
          retryable: false,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 404 },
    );
  return NextResponse.json({
    data: { receipt: createReceipt(diagnosis, `${caseId}:${key}`) },
  });
};
