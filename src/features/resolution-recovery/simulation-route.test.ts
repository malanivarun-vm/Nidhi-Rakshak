import { describe, expect, it } from "vitest";
import { POST } from "../../../app/api/resolution/[caseId]/simulations/route";

const body = {
  proposedChange: { field: "bank_account_number", before: "old", after: "new" },
  before: { supportedBlockerCount: 1 },
  after: { supportedBlockerCount: 0 },
};

const request = (payload: unknown, key = "simulation-1") =>
  new Request(
    "http://localhost/api/resolution/case-golden-fix-bank/simulations",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify(payload),
    },
  );

describe("simulation route envelope", () => {
  it("returns a validated simulation in the shared data envelope", async () => {
    const response = await POST(request(body), {
      params: Promise.resolve({ caseId: "case-golden-fix-bank" }),
    });
    const responseBody = (await response.json()) as {
      data: { simulation: { safety: string; disclaimer: string } };
    };

    expect(response.status).toBe(200);
    expect(responseBody.data.simulation.safety).toBe("SAFE");
    expect(responseBody.data.simulation.disclaimer).toContain(
      "does not predict claim approval",
    );
  });

  it("returns the original result for a duplicate idempotency key", async () => {
    const context = {
      params: Promise.resolve({ caseId: "case-golden-fix-bank" }),
    };
    const first = await POST(request(body, "duplicate-route-key"), context);
    const duplicate = await POST(
      request(
        { ...body, after: { supportedBlockerCount: 7 } },
        "duplicate-route-key",
      ),
      context,
    );

    expect((await duplicate.json()).data.simulation).toEqual(
      (await first.json()).data.simulation,
    );
  });

  it("rejects malformed input and missing idempotency keys", async () => {
    const malformed = new Request(
      "http://localhost/api/resolution/case-golden-fix-bank/simulations",
      { method: "POST", body: "not-json" },
    );
    const invalidResponse = await POST(malformed, {
      params: Promise.resolve({ caseId: "case-golden-fix-bank" }),
    });
    const missingKeyResponse = await POST(
      new Request(
        "http://localhost/api/resolution/case-golden-fix-bank/simulations",
        { method: "POST", body: JSON.stringify(body) },
      ),
      { params: Promise.resolve({ caseId: "case-golden-fix-bank" }) },
    );

    expect(invalidResponse.status).toBe(400);
    expect(missingKeyResponse.status).toBe(400);
  });
});
