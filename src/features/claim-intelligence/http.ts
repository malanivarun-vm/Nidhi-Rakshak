import { NextResponse } from "next/server";
import { z } from "zod";

const requestId = () => globalThis.crypto.randomUUID();

export const caseIdSchema = z.string().trim().min(1).max(120);
export const claimIdSchema = z.string().uuid();

type ErrorResponseInput = {
  code: string;
  message: string;
  retryable: boolean;
  status: number;
};

export function createErrorResponse({
  code,
  message,
  retryable,
  status,
}: ErrorResponseInput) {
  return NextResponse.json(
    { error: { code, message, retryable, requestId: requestId() } },
    { status },
  );
}

export function createNotImplementedResponse(code: string) {
  return createErrorResponse({
    code,
    message: "This Claim Intelligence route is not available yet.",
    retryable: true,
    status: 501,
  });
}

export function requireIdempotencyKey(request: Request) {
  if (request.headers.get("idempotency-key")) return null;

  return createErrorResponse({
    code: "MISSING_IDEMPOTENCY_KEY",
    message: "An Idempotency-Key header is required for this request.",
    retryable: false,
    status: 400,
  });
}
