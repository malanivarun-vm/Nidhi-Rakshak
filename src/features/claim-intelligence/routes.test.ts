import { describe, expect, it } from "vitest";
import { GET as getRescueContext } from "../../../app/api/claims/[claimId]/rescue-context/route";
import { GET } from "../../../app/api/rescue-cases/[caseId]/diagnosis/route";
import { DiagnosisResult, ErrorEnvelope } from "../../domain/contracts";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";

function restoreFixtureMode(previousFixtureMode: string | undefined) {
  if (previousFixtureMode === undefined) {
    Reflect.deleteProperty(process.env, "NIDHI_FIXTURE_MODE");
    return;
  }

  process.env.NIDHI_FIXTURE_MODE = previousFixtureMode;
}

describe("diagnosis route", () => {
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

  it("returns an exact fixture diagnosis through the shared data envelope", async () => {
    const previousFixtureMode = process.env.NIDHI_FIXTURE_MODE;
    process.env.NIDHI_FIXTURE_MODE = "true";

    try {
      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ caseId: "case-golden-fight-relation-name" }),
      });

      expect(response.status).toBe(200);
      expect(DiagnosisResult.parse((await response.json()).data)).toMatchObject(
        {
          caseId: "case-golden-fight-relation-name",
        },
      );
    } finally {
      restoreFixtureMode(previousFixtureMode);
    }
  });

  it("returns every frozen golden diagnosis unchanged through the API", async () => {
    const previousFixtureMode = process.env.NIDHI_FIXTURE_MODE;
    process.env.NIDHI_FIXTURE_MODE = "true";

    try {
      for (const fixture of Object.values(GOLDEN_FIXTURES)) {
        const response = await GET(new Request("http://localhost"), {
          params: Promise.resolve({ caseId: fixture.caseId }),
        });

        expect(response.status).toBe(200);
        expect(DiagnosisResult.parse((await response.json()).data)).toEqual(
          fixture,
        );
      }
    } finally {
      restoreFixtureMode(previousFixtureMode);
    }
  });

  it("returns an intentional empty-case response when no golden diagnosis exists", async () => {
    const previousFixtureMode = process.env.NIDHI_FIXTURE_MODE;
    process.env.NIDHI_FIXTURE_MODE = "true";

    try {
      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ caseId: "case-not-in-fixtures" }),
      });

      expect(response.status).toBe(404);
      expect(ErrorEnvelope.parse(await response.json())).toMatchObject({
        error: { code: "DIAGNOSIS_NOT_FOUND", retryable: false },
      });
    } finally {
      restoreFixtureMode(previousFixtureMode);
    }
  });

  it("does not serve fixture data when fixture mode is disabled", async () => {
    const previousFixtureMode = process.env.NIDHI_FIXTURE_MODE;
    const previousDatabaseUrl = process.env.DATABASE_URL;
    Reflect.deleteProperty(process.env, "NIDHI_FIXTURE_MODE");
    Reflect.deleteProperty(process.env, "DATABASE_URL");

    try {
      const response = await GET(new Request("http://localhost"), {
        params: Promise.resolve({ caseId: "case-golden-fight-relation-name" }),
      });

      expect(response.status).toBe(503);
      expect(ErrorEnvelope.parse(await response.json())).toMatchObject({
        error: { code: "DIAGNOSIS_PROVIDER_UNAVAILABLE", retryable: true },
      });
    } finally {
      restoreFixtureMode(previousFixtureMode);
      if (previousDatabaseUrl === undefined) {
        Reflect.deleteProperty(process.env, "DATABASE_URL");
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    }
  });
});
