import { NextResponse } from "next/server";
import { databasePersistence } from "../../../../../src/features/resolution-recovery/persistence";
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
  const receipt = createReceipt(diagnosis, `${caseId}:${key}`);
  await databasePersistence.saveReceipt(diagnosis, receipt);
  return NextResponse.json({ data: { receipt } });
};
