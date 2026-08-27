import { NextResponse } from "next/server";
import { databasePersistence } from "../../../../../src/features/resolution-recovery/persistence";
import { getResolutionDiagnosis } from "../../../../../src/features/resolution-recovery/provider";
import { createHandoff } from "../../../../../src/features/resolution-recovery/recovery";

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
          message: "A handoff key is required.",
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
    const artifact = createHandoff({ ...body, diagnosis }, `${caseId}:${key}`);
    await databasePersistence.saveHandoff(diagnosis, artifact);
    return NextResponse.json({
      data: {
        artifact,
      },
    });
  } catch (error) {
    const retryable =
      error instanceof Error &&
      error.message === "ARTIFACT_GENERATION_RETRYABLE";
    return NextResponse.json(
      {
        error: {
          code: retryable ? "ARTIFACT_RETRYABLE" : "INVALID_HANDOFF",
          message: retryable
            ? "The package could not be prepared. Try again."
            : "Approve the preview before sharing.",
          retryable,
          requestId: crypto.randomUUID(),
        },
      },
      { status: retryable ? 503 : 400 },
    );
  }
};
