import { describe, expect, it } from "vitest";
import { GET } from "../../../app/api/resolution/[caseId]/route";
import { DiagnosisResult } from "../../domain/contracts";

describe("resolution route envelope", () => {
  it.each([
    "case-golden-fight-relation-name",
    "case-golden-forward-exit-date",
    "case-golden-fix-bank",
    "case-golden-unsupported",
  ])("serves %s through the B provider", async (caseId) => {
    const response = await GET(
      new Request(`http://localhost/api/resolution/${caseId}`),
      {
        params: Promise.resolve({ caseId }),
      },
    );
    const body = (await response.json()) as {
      data: { diagnosis: unknown; state: unknown };
    };

    expect(response.status).toBe(200);
    expect(DiagnosisResult.safeParse(body.data.diagnosis).success).toBe(true);
    expect(body.data.state).toBeDefined();
  });

  it("returns the shared error envelope for an unknown case", async () => {
    const response = await GET(
      new Request("http://localhost/api/resolution/case-unknown"),
      {
        params: Promise.resolve({ caseId: "case-unknown" }),
      },
    );
    const body = (await response.json()) as {
      error: { code: string; retryable: boolean; requestId: string };
    };

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("RESOLUTION_CASE_NOT_FOUND");
    expect(body.error.retryable).toBe(false);
    expect(body.error.requestId).toBeTruthy();
  });
});
