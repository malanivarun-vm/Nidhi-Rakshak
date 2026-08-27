import { describe, expect, it } from "vitest";
import { DiagnosisResult } from "../../domain/contracts";
import { createFixtureDiagnosisProvider } from "./diagnosis-provider";

describe("fixture diagnosis provider", () => {
  it("returns a shared-contract diagnosis for a known fixture case", async () => {
    const provider = createFixtureDiagnosisProvider();

    const result = await provider.getByCaseId(
      "case-golden-fight-relation-name",
    );

    expect(DiagnosisResult.parse(result)).toMatchObject({
      caseId: "case-golden-fight-relation-name",
      contractVersion: "1",
    });
  });

  it("returns null when the case has no fixture diagnosis", async () => {
    const provider = createFixtureDiagnosisProvider();

    await expect(provider.getByCaseId("case-unknown")).resolves.toBeNull();
  });
});
