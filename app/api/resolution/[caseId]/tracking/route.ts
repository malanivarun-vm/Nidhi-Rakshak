import { NextResponse } from "next/server";
import { getTracking } from "../../../../../src/features/resolution-recovery/recovery";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ caseId: string }> },
) => {
  const { caseId } = await context.params;
  return NextResponse.json({ data: { tracking: getTracking(caseId) } });
};
