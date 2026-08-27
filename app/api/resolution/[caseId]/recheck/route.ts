import { NextResponse } from "next/server";
import { databasePersistence } from "../../../../../src/features/resolution-recovery/persistence";
import { getResolutionDiagnosis } from "../../../../../src/features/resolution-recovery/provider";
import { recheckCase } from "../../../../../src/features/resolution-recovery/recovery";

export const POST = async (
  request: Request,
  context: { params: Promise<{ caseId: string }> },
) => {
  const { caseId } = await context.params;
  const key = request.headers.get("Idempotency-Key");
  if (!key)
    return NextResponse.json(
      {
        error: {
          code: "IDEMPOTENCY_KEY_REQUIRED",
          message: "A re-check key is required.",
          retryable: false,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 400 },
    );
  const diagnosis = await getResolutionDiagnosis(caseId);
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
  try {
    const result = await recheckCase({ diagnosis }, `${caseId}:${key}`);
    await databasePersistence.saveRecheck(diagnosis, result);
    return NextResponse.json({ data: { result } });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "RECHECK_UNSUPPORTED",
          message: "This case cannot be checked again yet.",
          retryable: false,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 422 },
    );
  }
};
