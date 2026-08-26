import { describe, expect, it } from "vitest";
import {
  generateSyntheticCases,
  summarizeSyntheticCases,
} from "./mock-population";

describe("synthetic population", () => {
  it("is deterministic and preserves the golden cases", () => {
    const first = generateSyntheticCases();
    expect(first).toEqual(generateSyntheticCases());
    expect(first).toHaveLength(500);
    expect(first.filter((item) => item.golden)).toHaveLength(4);
    expect(summarizeSyntheticCases(first).journey.UNSUPPORTED).toBeGreaterThan(
      25,
    );
  });
});
