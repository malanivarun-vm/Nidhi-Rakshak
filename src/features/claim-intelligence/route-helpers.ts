import type { NextResponse } from "next/server";
import {
  caseIdSchema,
  createErrorResponse,
  createNotImplementedResponse,
} from "./http";

export type CaseRouteContext = {
  params: Promise<{ caseId: string }>;
};

export async function requireCaseId(
  context: CaseRouteContext,
): Promise<string | NextResponse> {
  const { caseId } = await context.params;
  const parsedCaseId = caseIdSchema.safeParse(caseId);

  if (parsedCaseId.success) return parsedCaseId.data;

  return createErrorResponse({
    code: "INVALID_CASE_ID",
    message: "A valid case ID is required.",
    retryable: false,
    status: 400,
  });
}

export function isRouteResponse(
  value: string | NextResponse,
): value is NextResponse {
  return typeof value !== "string";
}

export function unavailableCaseRoute(code: string) {
  return createNotImplementedResponse(code);
}
