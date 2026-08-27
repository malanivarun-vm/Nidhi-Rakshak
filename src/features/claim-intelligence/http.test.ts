import { describe, expect, it } from "vitest";
import { ErrorEnvelope } from "../../domain/contracts";
import { createErrorResponse } from "./http";

describe("claim intelligence HTTP envelope", () => {
  it("returns the shared error envelope", async () => {
    const response = createErrorResponse({
      code: "NOT_IMPLEMENTED",
      message: "This route is not available yet.",
      retryable: false,
      status: 501,
    });

    expect(response.status).toBe(501);
    expect(ErrorEnvelope.parse(await response.json())).toMatchObject({
      error: { code: "NOT_IMPLEMENTED", retryable: false },
    });
  });
});
