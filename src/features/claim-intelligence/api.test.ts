import { beforeEach, describe, expect, it } from "vitest";
import { GET as getRescueContext } from "../../../app/api/claims/[claimId]/rescue-context/route";
import { POST as diagnose } from "../../../app/api/rescue-cases/[caseId]/diagnose/route";
import {
  POST as addEvidence,
  GET as getEvidence,
} from "../../../app/api/rescue-cases/[caseId]/evidence/route";
import { GET as getCase } from "../../../app/api/rescue-cases/[caseId]/route";
import { GET as getTimeline } from "../../../app/api/rescue-cases/[caseId]/timeline/route";
import { GET as getVerdict } from "../../../app/api/rescue-cases/[caseId]/verdict/route";
import {
  POST as createCase,
  GET as getCaseList,
} from "../../../app/api/rescue-cases/route";
import { resetClaimApiStore, stableUuid } from "./api";

const caseId = "case-golden-fight-relation-name";
const context = { params: Promise.resolve({ caseId }) };

const request = (body: unknown, key = "test-key") =>
  new Request("http://localhost/api/rescue-cases", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });

describe("Claim Intelligence API", () => {
  beforeEach(() => {
    process.env.NIDHI_FIXTURE_MODE = "true";
    resetClaimApiStore();
  });

  it("lists the four golden cases in fixture mode", async () => {
    const response = await getCaseList();

    expect(response.status).toBe(200);
    expect((await response.json()).data.cases).toHaveLength(4);
  });

  it("creates and reads a fixture rescue case idempotently", async () => {
    const first = await createCase(request({ caseId }, "create-case"));
    const duplicate = await createCase(request({ caseId }, "create-case"));
    expect(first.status).toBe(200);
    expect((await duplicate.json()).data.case).toEqual(
      (await first.clone().json()).data.case,
    );

    const response = await getCase(new Request("http://localhost"), context);
    expect(response.status).toBe(200);
    expect((await response.json()).data.case.caseId).toBe(caseId);
  });

  it("runs diagnosis and exposes evidence, timeline, and verdict projections", async () => {
    const response = await diagnose(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Idempotency-Key": "diagnose-key" },
      }),
      context,
    );
    expect(response.status).toBe(200);
    expect((await response.json()).data.verdict).toBe("FIGHT");

    const evidence = await getEvidence(
      new Request("http://localhost"),
      context,
    );
    expect((await evidence.json()).data.evidence).toHaveLength(2);

    const added = await addEvidence(
      new Request("http://localhost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "evidence-key",
        },
        body: JSON.stringify({
          source: "member_document",
          label: "Appointment letter",
          state: "VERIFIED",
        }),
      }),
      context,
    );
    expect(added.status).toBe(200);

    const timeline = await getTimeline(
      new Request("http://localhost"),
      context,
    );
    expect((await timeline.json()).data.timeline[0].source).toBe(
      "member_id_2019",
    );

    const verdict = await getVerdict(new Request("http://localhost"), context);
    expect((await verdict.json()).data).toMatchObject({
      verdict: "FIGHT",
      owner: "EPFO",
    });
  });

  it.runIf(process.env.DATABASE_URL)(
    "restores uploaded evidence after a database-backed reload",
    async () => {
      process.env.NIDHI_FIXTURE_MODE = "false";
      resetClaimApiStore();

      const uploaded = await addEvidence(
        new Request("http://localhost", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": "database-evidence-reload",
          },
          body: JSON.stringify({
            source: "member_document",
            label: "Persisted appointment letter",
            state: "VERIFIED",
          }),
        }),
        context,
      );
      expect(uploaded.status).toBe(200);

      resetClaimApiStore();
      const reloaded = await getEvidence(
        new Request("http://localhost"),
        context,
      );

      expect((await reloaded.json()).data.evidence).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source: "member_document",
            label: "Persisted appointment letter",
            state: "VERIFIED",
          }),
        ]),
      );
    },
  );

  it("returns validated context for a fixture claim UUID", async () => {
    const response = await getRescueContext(new Request("http://localhost"), {
      params: Promise.resolve({ claimId: stableUuid(caseId) }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({
      caseId,
      claim: { claimId: stableUuid(caseId) },
    });
  });
});
