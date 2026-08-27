import { describe, expect, it } from "vitest";
import { DiagnosisResult } from "../../domain/contracts";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";
import {
  createDatabaseDiagnosisProvider,
  createFixtureDiagnosisProvider,
} from "./diagnosis-provider";

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

  it("validates a diagnosis returned by the database repository seam", async () => {
    const provider = createDatabaseDiagnosisProvider({
      async getLatestByCaseId() {
        return GOLDEN_FIXTURES.GOLDEN_FIX_BANK;
      },
    });

    await expect(provider.getByCaseId("case-golden-fix-bank")).resolves.toEqual(
      GOLDEN_FIXTURES.GOLDEN_FIX_BANK,
    );
  });
});
