import { describe, expect, it } from "vitest";
import { DiagnosisResult } from "../../domain/contracts";
import {
  createDiagnosisApiProvider,
  getFixtureDiagnosisForApi,
} from "./diagnosis-api-provider";

describe("A5 diagnosis API fixture adapter", () => {
  it("serves only a validated golden diagnosis in explicit fixture mode", async () => {
    const result = await getFixtureDiagnosisForApi({
      caseId: "case-golden-fight-relation-name",
      environment: { NIDHI_FIXTURE_MODE: "true" },
    });

    expect(DiagnosisResult.parse(result)).toMatchObject({
      caseId: "case-golden-fight-relation-name",
      contractVersion: "1",
    });
  });

  it("does not silently substitute fixture data outside fixture mode", async () => {
    expect(
      createDiagnosisApiProvider({ NIDHI_FIXTURE_MODE: "false" }),
    ).toBeNull();
    await expect(
      getFixtureDiagnosisForApi({
        caseId: "case-golden-fight-relation-name",
        environment: {},
      }),
    ).resolves.toBeNull();
  });

  it("returns no diagnosis for a case outside the four stable fixtures", async () => {
    await expect(
      getFixtureDiagnosisForApi({
        caseId: "case-not-in-fixtures",
        environment: { NIDHI_FIXTURE_MODE: "true" },
      }),
    ).resolves.toBeNull();
  });
});
