import { describe, expect, it } from "vitest";
import { GOLDEN_UNSUPPORTED } from "../../domain/golden-fixtures";
import { toResolutionState } from "./state";

describe("resolution state model", () => {
  it("projects a diagnosis into refusal state", () => {
    expect(toResolutionState(GOLDEN_UNSUPPORTED)).toEqual({
      status: "refusal",
      diagnosis: GOLDEN_UNSUPPORTED,
    });
  });

  it("projects a missing diagnosis into empty state", () => {
    expect(toResolutionState(undefined)).toEqual({ status: "empty" });
  });
});
