import { NextResponse } from "next/server";
import { getResolutionDiagnosis } from "../../../../src/features/resolution-recovery/provider";
import { toResolutionState } from "../../../../src/features/resolution-recovery/state";

interface ResolutionRouteContext {
  params: Promise<{ caseId: string }>;
}

export const GET = async (
  _request: Request,
  context: ResolutionRouteContext,
) => {
  const { caseId } = await context.params;
  const diagnosis = await getResolutionDiagnosis(caseId);

  if (!diagnosis) {
    return NextResponse.json(
      {
        error: {
          code: "RESOLUTION_CASE_NOT_FOUND",
          message: "Resolution case was not found.",
          retryable: false,
          requestId: crypto.randomUUID(),
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    data: { diagnosis, state: toResolutionState(diagnosis) },
  });
};
