import { describe, expect, it } from "vitest";
import { GET as getRescueContext } from "../../../app/api/claims/[claimId]/rescue-context/route";
import { GET } from "../../../app/api/rescue-cases/[caseId]/diagnosis/route";
import { ErrorEnvelope } from "../../domain/contracts";

describe("diagnosis route skeleton", () => {
  it("rejects an invalid claim id at the rescue-context boundary", async () => {
    const response = await getRescueContext(new Request("http://localhost"), {
      params: Promise.resolve({ claimId: "not-a-uuid" }),
    });

    expect(response.status).toBe(400);
    expect(ErrorEnvelope.parse(await response.json())).toMatchObject({
      error: { code: "INVALID_CLAIM_ID", retryable: false },
    });
  });

  it("rejects an invalid case id using the shared error envelope", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ caseId: "" }),
    });

    expect(response.status).toBe(400);
    expect(ErrorEnvelope.parse(await response.json())).toMatchObject({
      error: { code: "INVALID_CASE_ID", retryable: false },
    });
  });

  it("returns an explicit unavailable response for a valid case id", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ caseId: "case-golden-fight-relation-name" }),
    });

    expect(response.status).toBe(501);
    expect(ErrorEnvelope.parse(await response.json())).toMatchObject({
      error: { code: "DIAGNOSIS_NOT_READY", retryable: true },
    });
  });
});
