import { NextResponse } from "next/server";
import { databasePersistence } from "../../../../../src/features/resolution-recovery/persistence";
import { getResolutionDiagnosis } from "../../../../../src/features/resolution-recovery/provider";
import { createResolutionAction } from "../../../../../src/features/resolution-recovery/recovery";

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
          message: "An action key is required.",
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
    const body = (await request.json()) as Record<string, unknown>;
    const action = createResolutionAction(
      { ...body, diagnosis },
      `${caseId}:${key}`,
    );
    await databasePersistence.saveAction(diagnosis, action);
    return NextResponse.json({ data: { action } });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_ACTION",
          message: "Approve the preview before continuing.",
          retryable: false,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 400 },
    );
  }
};
