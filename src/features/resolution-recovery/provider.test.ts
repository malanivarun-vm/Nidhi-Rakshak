import { describe, expect, it } from "vitest";
import { DiagnosisResult } from "../../domain/contracts";
import { getResolutionDiagnosis } from "./provider";

const cases = [
  [
    "case-golden-fight-relation-name",
    "diagnosis-golden-fight-relation-name",
    "FIGHT",
  ],
  [
    "case-golden-forward-exit-date",
    "diagnosis-golden-forward-exit-date",
    "FORWARD",
  ],
  ["case-golden-fix-bank", "diagnosis-golden-fix-bank", "FIX"],
  ["case-golden-unsupported", "diagnosis-golden-unsupported", undefined],
] as const;

describe("fixture-backed resolution provider", () => {
  it.each(cases)(
    "returns the unchanged diagnosis for %s",
    async (caseId, diagnosisId, verdict) => {
      const result = await getResolutionDiagnosis(caseId);
      if (!result) throw new Error("expected golden fixture");

      expect(DiagnosisResult.parse(result)).toEqual(result);
      expect(result.caseId).toBe(caseId);
      expect(result.diagnosisId).toBe(diagnosisId);
      expect(result.verdict).toBe(verdict);
    },
  );

  it("returns no diagnosis for an unknown case", async () => {
    await expect(
      getResolutionDiagnosis("case-unknown"),
    ).resolves.toBeUndefined();
  });
});
