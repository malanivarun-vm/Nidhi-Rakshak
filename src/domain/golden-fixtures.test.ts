import { describe, expect, it } from "vitest";
import { DiagnosisResult } from "./contracts";
import { GOLDEN_FIXTURES } from "./golden-fixtures";

describe("DiagnosisResult contract", () => {
  it("validates every golden fixture", () => {
    for (const fixture of Object.values(GOLDEN_FIXTURES))
      expect(DiagnosisResult.parse(fixture)).toEqual(fixture);
  });

  it("keeps the four demo outcomes distinct", () => {
    expect(GOLDEN_FIXTURES.GOLDEN_FIGHT_RELATION_NAME.verdict).toBe("FIGHT");
    expect(GOLDEN_FIXTURES.GOLDEN_FORWARD_EXIT_DATE.verdict).toBe("FORWARD");
    expect(GOLDEN_FIXTURES.GOLDEN_FIX_BANK.verdict).toBe("FIX");
    expect(GOLDEN_FIXTURES.GOLDEN_UNSUPPORTED.verdict).toBeUndefined();
  });
});
