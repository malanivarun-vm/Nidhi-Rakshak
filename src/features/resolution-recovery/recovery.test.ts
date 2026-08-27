import { beforeEach, describe, expect, it } from "vitest";
import {
  GOLDEN_FIGHT_RELATION_NAME,
  GOLDEN_FIX_BANK,
  GOLDEN_FORWARD_EXIT_DATE,
} from "../../domain/golden-fixtures";
import {
  buildConsentPreview,
  createHandoff,
  createReceipt,
  createResolutionAction,
  getTracking,
  recheckCase,
  resetRecoveryStore,
} from "./recovery";

describe("resolution recovery persistence", () => {
  beforeEach(() => resetRecoveryStore());

  it("previews consent and rejects unapproved actions", () => {
    const preview = buildConsentPreview(GOLDEN_FIGHT_RELATION_NAME);
    expect(preview.payload.simulated).toContain("will be changed");
    expect(() =>
      createResolutionAction(
        {
          diagnosis: GOLDEN_FIGHT_RELATION_NAME,
          actionType: "EPFO_REVIEW",
          consent: { approved: false, text: "No" },
          payload: {},
        },
        "a",
      ),
    ).toThrow();
    expect(() =>
      createResolutionAction(
        {
          diagnosis: {
            ...GOLDEN_FIGHT_RELATION_NAME,
            status: "UNSUPPORTED",
            verdict: undefined,
          },
          actionType: "EPFO_REVIEW",
          consent: { approved: true, text: "I approve" },
          payload: {},
        },
        "unsupported",
      ),
    ).toThrow("ACTION_NOT_AVAILABLE");
  });

  it("persists a duplicate action once and records history", () => {
    const input = {
      diagnosis: GOLDEN_FIGHT_RELATION_NAME,
      actionType: "EPFO_REVIEW",
      consent: { approved: true, text: "I approve" },
      payload: { issue: "mismatch", nextAction: "review" },
    };
    const first = createResolutionAction(input, "same");
    expect(
      createResolutionAction(
        { ...input, payload: { issue: "changed", nextAction: "other" } },
        "same",
      ),
    ).toEqual(first);
    expect(getTracking(GOLDEN_FIGHT_RELATION_NAME.caseId).events).toHaveLength(
      1,
    );
  });

  it("keeps wait as a valid no-action state", () => {
    const action = createResolutionAction(
      {
        diagnosis: GOLDEN_FIGHT_RELATION_NAME,
        actionType: "WAIT",
        consent: { approved: true, text: "I approve" },
        payload: { issue: "transfer", nextAction: "wait" },
      },
      "wait",
    );
    expect(action.status).toBe("WAITING");
    expect(getTracking(GOLDEN_FIGHT_RELATION_NAME.caseId).status).toBe(
      "WAITING",
    );
  });

  it.each([
    [GOLDEN_FORWARD_EXIT_DATE, "EMPLOYER"],
    [GOLDEN_FIGHT_RELATION_NAME, "EPFO"],
    [{ ...GOLDEN_FIX_BANK, owner: "BANK" as const }, "BANK"],
  ] as const)("creates a %s owner artifact", (diagnosis, kind) => {
    const artifact = createHandoff(
      {
        diagnosis,
        consent: { approved: true, text: "I approve" },
        payload: { issue: diagnosis.problemSummary },
      },
      `handoff-${kind}`,
    );
    expect(artifact.kind).toBe(kind);
    expect(artifact.payload.submissionStatus).toBe("NOT_SUBMITTED");
  });

  it("creates a stable receipt payload and retries failed artifacts", () => {
    const receipt = createReceipt(GOLDEN_FIX_BANK, "receipt");
    expect(createReceipt(GOLDEN_FIX_BANK, "receipt")).toEqual(receipt);
    expect(receipt.payload.simulated).toContain("No external submission");
    expect(() =>
      createHandoff(
        {
          diagnosis: GOLDEN_FORWARD_EXIT_DATE,
          consent: { approved: true, text: "I approve" },
          payload: {},
          simulateFailure: true,
        },
        "failed",
      ),
    ).toThrow("ARTIFACT_GENERATION_RETRYABLE");
    expect(
      createHandoff(
        {
          diagnosis: GOLDEN_FORWARD_EXIT_DATE,
          consent: { approved: true, text: "I approve" },
          payload: {},
        },
        "failed",
      ).kind,
    ).toBe("EMPLOYER");
  });

  it("projects re-check outcomes and preserves event history", async () => {
    const resolved = await recheckCase(
      { diagnosis: GOLDEN_FIX_BANK },
      "resolved",
    );
    const same = await recheckCase(
      { diagnosis: GOLDEN_FIGHT_RELATION_NAME },
      "same",
    );
    expect(resolved.outcome).toBe("RESOLVED");
    expect(same.outcome).toBe("SAME_BLOCKER");
    expect(
      (await recheckCase({ diagnosis: GOLDEN_FIGHT_RELATION_NAME }, "same"))
        .outcome,
    ).toBe("SAME_BLOCKER");
    expect(getTracking(GOLDEN_FIGHT_RELATION_NAME.caseId).events).toHaveLength(
      1,
    );
  });
});
