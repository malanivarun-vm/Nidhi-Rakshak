import { describe, expect, it } from "vitest";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";
import { createSimulationService, simulateChange } from "./simulation";
import { translateDiagnosis } from "./translation";

const safeFix = {
  proposedChange: { field: "bank_account_number", before: "old", after: "new" },
  before: { supportedBlockerCount: 1 },
  after: { supportedBlockerCount: 0 },
};

describe("resolution translation", () => {
  it("translates every golden fixture without exposing internal verdict taxonomy", () => {
    const fight = translateDiagnosis(
      GOLDEN_FIXTURES.GOLDEN_FIGHT_RELATION_NAME,
    );
    const forward = translateDiagnosis(
      GOLDEN_FIXTURES.GOLDEN_FORWARD_EXIT_DATE,
    );
    const fix = translateDiagnosis(GOLDEN_FIXTURES.GOLDEN_FIX_BANK);
    const unsupported = translateDiagnosis(GOLDEN_FIXTURES.GOLDEN_UNSUPPORTED);

    expect(fight.headline).toBe(
      "Your current details are correct. Don’t change them.",
    );
    expect(fight.owner.label).toBe("EPFO");
    expect(fight.route.label).toBe("Resolve this with EPFO");
    expect(forward.headline).toBe("Your previous employer needs to fix this.");
    expect(forward.owner.label).toBe("Your previous employer");
    expect(forward.route.label).toBe("Send this to your employer");
    expect(fix.headline).toBe("One detail needs to be corrected.");
    expect(fix.route.label).toBe("Fix this detail");
    expect(unsupported.headline).toBe(
      "We can’t safely tell you what to change yet.",
    );
    expect(unsupported.route.actionAvailable).toBe(false);
    expect(JSON.stringify({ fight, forward, fix, unsupported })).not.toContain(
      "FIGHT",
    );
  });

  it("refuses consequential translation when verdict is missing", () => {
    const result = translateDiagnosis({
      ...GOLDEN_FIXTURES.GOLDEN_UNSUPPORTED,
      status: "NEEDS_EVIDENCE",
      rejectionCode: "BANK_DETAILS_INVALID",
    });

    expect(result.route).toEqual({
      label: "No action needed",
      actionAvailable: false,
    });
    expect(result.recommendedAction).toContain("EPFO grievance");
  });
});

describe("safe resolution simulation", () => {
  it("reports before, after, delta, safety and disclaimer", () => {
    const result = simulateChange(GOLDEN_FIXTURES.GOLDEN_FIX_BANK, safeFix);

    expect(result.before.supportedBlockerCount).toBe(1);
    expect(result.after.supportedBlockerCount).toBe(0);
    expect(result.blockerDelta.change).toBe(-1);
    expect(result.safety).toBe("SAFE");
    expect(result.disclaimer).not.toContain("approved");
    expect(result.disclaimer).toContain("does not predict claim approval");
  });

  it("marks a change unsafe when it creates blockers or violates do-not-touch", () => {
    const result = simulateChange(GOLDEN_FIXTURES.GOLDEN_FIGHT_RELATION_NAME, {
      proposedChange: {
        field: "current_name",
        before: "RAMESH",
        after: "RAJESH",
      },
      before: { supportedBlockerCount: 1 },
      after: { supportedBlockerCount: 2 },
    });

    expect(result.safety).toBe("UNSAFE");
    expect(result.blockerDelta.change).toBe(1);
    expect(result.recommendation).toBe("Do not make this change.");
  });

  it("does not simulate a consequential action without a verdict", () => {
    const result = simulateChange(
      { ...GOLDEN_FIXTURES.GOLDEN_UNSUPPORTED, status: "NEEDS_EVIDENCE" },
      safeFix,
    );

    expect(result.safety).toBe("NOT_AVAILABLE");
    expect(result.recommendation).toContain("Do not make this change");
  });

  it("returns the original result for a duplicate simulation key", () => {
    const service = createSimulationService();
    const first = service.simulate(
      GOLDEN_FIXTURES.GOLDEN_FIX_BANK,
      safeFix,
      "sim-1",
    );
    const duplicate = service.simulate(
      GOLDEN_FIXTURES.GOLDEN_FIX_BANK,
      { ...safeFix, after: { supportedBlockerCount: 5 } },
      "sim-1",
    );

    expect(duplicate).toBe(first);
    expect(duplicate.after.supportedBlockerCount).toBe(0);
  });
});
