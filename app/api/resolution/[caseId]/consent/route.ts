import { NextResponse } from "next/server";
import { getResolutionDiagnosis } from "../../../../../src/features/resolution-recovery/provider";
import { buildConsentPreview } from "../../../../../src/features/resolution-recovery/recovery";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ caseId: string }> },
) => {
  const { caseId } = await context.params;
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
  return NextResponse.json({
    data: { preview: buildConsentPreview(diagnosis) },
  });
};
