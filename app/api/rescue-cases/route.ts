import { z } from "zod";
import { createClaimCase } from "../../../src/features/claim-intelligence/api";
import {
  createDatabaseCaseListProviderFromUrl,
  createFixtureCaseListProvider,
} from "../../../src/features/claim-intelligence/case-list";
import {
  createErrorResponse,
  requireIdempotencyKey,
} from "../../../src/features/claim-intelligence/http";

const inputSchema = z.object({ caseId: z.string().trim().min(1).max(120) });

export async function GET() {
  const provider =
    process.env.NIDHI_FIXTURE_MODE === "true"
      ? createFixtureCaseListProvider()
      : process.env.DATABASE_URL
        ? createDatabaseCaseListProviderFromUrl(process.env.DATABASE_URL)
        : undefined;
  if (!provider)
    return createErrorResponse({
      code: "CASE_LIST_UNAVAILABLE",
      message: "Your claims are temporarily unavailable.",
      retryable: true,
      status: 503,
    });
  try {
    return Response.json({ data: { cases: await provider.list() } });
  } catch {
    return createErrorResponse({
      code: "CASE_LIST_UNAVAILABLE",
      message: "Your claims are temporarily unavailable.",
      retryable: true,
      status: 503,
    });
  }
}

export async function POST(request: Request) {
  const idempotencyError = requireIdempotencyKey(request);
  if (idempotencyError) return idempotencyError;
  const body = await request.json().catch(() => undefined);
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success)
    return createErrorResponse({
      code: "INVALID_RESCUE_CASE",
      message: "A case ID is required.",
      retryable: false,
      status: 400,
    });
  const result = await createClaimCase({
    caseId: parsed.data.caseId,
    idempotencyKey: request.headers.get("idempotency-key") as string,
  });
  if (!result)
    return createErrorResponse({
      code: "RESCUE_CASE_NOT_FOUND",
      message: "The rejected claim could not be found.",
      retryable: false,
      status: 404,
    });
  return Response.json({
    data: {
      case: {
        caseId: result.case.diagnosis.caseId,
        status: result.case.diagnosis.status,
        diagnosis: result.case.diagnosis,
      },
    },
  });
}
