import { describe, expect, it } from "vitest";
import {
  GOLDEN_FIGHT_RELATION_NAME,
  GOLDEN_FIX_BANK,
  GOLDEN_FORWARD_EXIT_DATE,
  GOLDEN_UNSUPPORTED,
} from "../../domain/golden-fixtures";
import { toDiagnosisView } from "./diagnosis-view";

describe("diagnosis view copy", () => {
  it("makes the Fight safety warning and EPFO next step member-facing", () => {
    expect(toDiagnosisView(GOLDEN_FIGHT_RELATION_NAME)).toMatchObject({
      heading: "Your current details are correct. Don’t change them.",
      actionLabel: "Keep your current details and resolve this with EPFO.",
      ownerHeading: "EPFO needs to review this.",
      isRefusal: false,
    });
  });

  it("directs the Forward case to the previous employer without exposing an enum", () => {
    const view = toDiagnosisView(GOLDEN_FORWARD_EXIT_DATE);

    expect(view).toMatchObject({
      heading: "Your previous employer needs to fix this.",
      ownerHeading: "Your previous employer needs to fix this.",
    });
    expect(JSON.stringify(view)).not.toContain("FORWARD");
  });

  it("shows a correction direction for the Fix case", () => {
    const view = toDiagnosisView(GOLDEN_FIX_BANK);

    expect(view.actionLabel).toBe("Review where to correct it");
    expect(view.correctionRoute).toContain("EPFO KYC route");
  });

  it("renders unsupported as an intentional refusal with no action verdict", () => {
    expect(toDiagnosisView(GOLDEN_UNSUPPORTED)).toMatchObject({
      heading: "We can’t safely diagnose this rejection yet.",
      actionLabel: "Get help through EPFO",
      isRefusal: true,
    });
  });

  it("asks for one record instead of inventing advice when evidence is incomplete", () => {
    const view = toDiagnosisView({
      ...GOLDEN_FIX_BANK,
      status: "NEEDS_EVIDENCE",
      owner: "NONE",
      evidenceState: "INSUFFICIENT",
      verdict: undefined,
      nextRouteType: "NONE",
    });

    expect(view).toMatchObject({
      heading: "We need one more record to be sure.",
      actionLabel: "Add the missing record",
      needsEvidence: true,
    });
  });
});
