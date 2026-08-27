import { beforeEach, describe, expect, it } from "vitest";
import { POST as postAction } from "../../../app/api/rescue-cases/[caseId]/actions/route";
import { POST as postHandoff } from "../../../app/api/rescue-cases/[caseId]/handoffs/route";
import { POST as postReceipt } from "../../../app/api/rescue-cases/[caseId]/receipts/route";
import { POST as postRecheck } from "../../../app/api/rescue-cases/[caseId]/recheck/route";
import { GET as getResolution } from "../../../app/api/rescue-cases/[caseId]/resolution/route";
import { POST as postSimulation } from "../../../app/api/rescue-cases/[caseId]/simulations/route";
import { GET as getTracking } from "../../../app/api/rescue-cases/[caseId]/tracking/route";
import {
  GOLDEN_FIGHT_RELATION_NAME,
  GOLDEN_FIX_BANK,
  GOLDEN_FORWARD_EXIT_DATE,
  GOLDEN_UNSUPPORTED,
} from "../../domain/golden-fixtures";
import { resetRecoveryStore } from "./recovery";

const context = (caseId: string) => ({ params: Promise.resolve({ caseId }) });
const jsonRequest = (url: string, body: unknown, key: string) =>
  new Request(`http://localhost${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
const consent = { approved: true as const, text: "I approve this simulation." };

describe("golden resolution journeys", () => {
  beforeEach(() => resetRecoveryStore());

  it("runs Fight through receipt, tracking, and repeated rejection", async () => {
    const action = await postAction(
      jsonRequest(
        "/api/rescue-cases/fight/actions",
        {
          actionType: "EPFO_REVIEW",
          consent,
          payload: {
            issue: "relation mismatch",
            nextAction: "resolve with EPFO",
          },
        },
        "fight-action",
      ),
      context(GOLDEN_FIGHT_RELATION_NAME.caseId),
    );
    expect(action.status).toBe(200);
    const receipt = await postReceipt(
      jsonRequest("/api/rescue-cases/fight/receipts", {}, "fight-receipt"),
      context(GOLDEN_FIGHT_RELATION_NAME.caseId),
    );
    expect(receipt.status).toBe(200);
    const tracking = await getTracking(
      new Request("http://localhost"),
      context(GOLDEN_FIGHT_RELATION_NAME.caseId),
    );
    expect((await tracking.json()).data.tracking.simulated).toBe(true);
    const recheck = await postRecheck(
      jsonRequest("/api/rescue-cases/fight/recheck", {}, "fight-recheck"),
      context(GOLDEN_FIGHT_RELATION_NAME.caseId),
    );
    expect((await recheck.json()).data.result.outcome).toBe("SAME_BLOCKER");
  });

  it("runs Forward through employer handoff and tracking", async () => {
    const action = await postAction(
      jsonRequest(
        "/api/rescue-cases/forward/actions",
        {
          actionType: "EPFO_REVIEW",
          consent,
          payload: { issue: "exit date", nextAction: "ask employer" },
        },
        "forward-action",
      ),
      context(GOLDEN_FORWARD_EXIT_DATE.caseId),
    );
    expect(action.status).toBe(200);
    const handoff = await postHandoff(
      jsonRequest(
        "/api/rescue-cases/forward/handoffs",
        {
          consent,
          payload: { issue: "exit date", nextAction: "ask employer" },
        },
        "forward-handoff",
      ),
      context(GOLDEN_FORWARD_EXIT_DATE.caseId),
    );
    const body = (await handoff.json()) as {
      data: { artifact: { kind: string; payload: { simulated: boolean } } };
    };
    expect(handoff.status).toBe(200);
    expect(body.data.artifact.kind).toBe("EMPLOYER");
    expect(body.data.artifact.payload.simulated).toBe(true);
  });

  it("runs Fix through simulation, receipt, and resolution", async () => {
    const simulation = await postSimulation(
      jsonRequest(
        "/api/rescue-cases/fix/simulations",
        {
          proposedChange: {
            field: "bank_account_number",
            before: "old",
            after: "new",
          },
          before: { supportedBlockerCount: 1 },
          after: { supportedBlockerCount: 0 },
        },
        "fix-simulation",
      ),
      context(GOLDEN_FIX_BANK.caseId),
    );
    expect((await simulation.json()).data.simulation.safety).toBe("SAFE");
    const action = await postAction(
      jsonRequest(
        "/api/rescue-cases/fix/actions",
        {
          actionType: "MEMBER_CORRECTION",
          consent,
          payload: { issue: "bank detail", nextAction: "correct detail" },
        },
        "fix-action",
      ),
      context(GOLDEN_FIX_BANK.caseId),
    );
    expect(action.status).toBe(200);
    const recheck = await postRecheck(
      jsonRequest("/api/rescue-cases/fix/recheck", {}, "fix-recheck"),
      context(GOLDEN_FIX_BANK.caseId),
    );
    expect((await recheck.json()).data.result.outcome).toBe("RESOLVED");
  });

  it("keeps Unsupported on the refusal path", async () => {
    const resolution = await getResolution(
      new Request("http://localhost"),
      context(GOLDEN_UNSUPPORTED.caseId),
    );
    expect((await resolution.json()).data.state.status).toBe("refusal");
    const action = await postAction(
      jsonRequest(
        "/api/rescue-cases/unsupported/actions",
        {
          actionType: "EPFO_REVIEW",
          consent,
          payload: {},
        },
        "unsupported-action",
      ),
      context(GOLDEN_UNSUPPORTED.caseId),
    );
    expect(action.status).toBe(400);
  });
});
