import { z } from "zod";
import type { DiagnosisResult, OwnerType } from "../../domain/contracts";
import { DiagnosisResult as DiagnosisResultSchema } from "../../domain/contracts";
import { translateDiagnosis } from "./translation";

const ConsentSchema = z.object({
  approved: z.literal(true),
  text: z.string().min(1),
});
export type Consent = z.infer<typeof ConsentSchema>;

const ActionInputSchema = z.object({
  diagnosis: z.unknown(),
  actionType: z.enum(["EPFO_REVIEW", "MEMBER_CORRECTION", "WAIT"]),
  consent: ConsentSchema,
  payload: z.record(z.string(), z.string()),
});
export type ActionInput = z.infer<typeof ActionInputSchema>;

const HandoffInputSchema = z.object({
  diagnosis: z.unknown(),
  consent: ConsentSchema,
  payload: z.record(z.string(), z.string()),
  simulateFailure: z.boolean().optional(),
});
export type HandoffInput = z.infer<typeof HandoffInputSchema>;

const RecheckInputSchema = z.object({ diagnosis: z.unknown() });

export interface StoredAction {
  id: string;
  idempotencyKey: string;
  caseId: string;
  diagnosisId: string;
  actionType: ActionInput["actionType"];
  status: "CONSENTED" | "WAITING";
  consent: Consent;
  payload: Record<string, string>;
  createdAt: string;
}

export interface StoredArtifact {
  id: string;
  idempotencyKey?: string;
  caseId: string;
  kind: "EMPLOYER" | "EPFO" | "BANK" | "RECEIPT";
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface StatusEvent {
  id: string;
  caseId: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string;
  createdAt: string;
}

export type RecheckResult =
  | { outcome: "RESOLVED"; diagnosisId: string; checkedAt: string }
  | {
      outcome: "SAME_BLOCKER" | "NEW_BLOCKER";
      diagnosis: DiagnosisResult;
      checkedAt: string;
    };

interface CaseStore {
  actions: Map<string, StoredAction>;
  handoffs: Map<string, StoredArtifact>;
  artifacts: Map<string, StoredArtifact>;
  events: StatusEvent[];
  rechecks: Map<string, RecheckResult>;
}

const store: CaseStore = {
  actions: new Map(),
  handoffs: new Map(),
  artifacts: new Map(),
  events: [],
  rechecks: new Map(),
};

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const actionKey = (caseId: string, key: string) => `${caseId}:${key}`;

const recordEvent = (caseId: string, toStatus: string, reason: string) => {
  const previous = [...store.events]
    .reverse()
    .find((event) => event.caseId === caseId);
  store.events.push({
    id: id("event"),
    caseId,
    fromStatus: previous?.toStatus ?? null,
    toStatus,
    reason,
    createdAt: now(),
  });
};

export const buildConsentPreview = (diagnosisInput: unknown) => {
  const diagnosis = DiagnosisResultSchema.parse(diagnosisInput);
  const translation = translateDiagnosis(diagnosis);
  return {
    caseId: diagnosis.caseId,
    diagnosisId: diagnosis.diagnosisId,
    owner: diagnosis.owner,
    action: translation.route.label,
    payload: {
      issue: diagnosis.problemSummary,
      nextAction: diagnosis.recommendedAction,
      simulated: "No EPFO, employer, or bank record will be changed.",
    },
  };
};

export const createResolutionAction = (
  input: unknown,
  idempotencyKey: string,
) => {
  const parsed = ActionInputSchema.parse(input);
  const diagnosis = DiagnosisResultSchema.parse(parsed.diagnosis);
  if (
    diagnosis.status !== "DIAGNOSED" ||
    diagnosis.verdict === undefined ||
    (diagnosis.verdict === "NONE" && parsed.actionType !== "WAIT")
  ) {
    throw new Error("ACTION_NOT_AVAILABLE");
  }
  const key = actionKey(diagnosis.caseId, idempotencyKey);
  const existing = store.actions.get(key);
  if (existing) return existing;

  const action: StoredAction = {
    id: id("action"),
    idempotencyKey,
    caseId: diagnosis.caseId,
    diagnosisId: diagnosis.diagnosisId,
    actionType: parsed.actionType,
    status: parsed.actionType === "WAIT" ? "WAITING" : "CONSENTED",
    consent: parsed.consent,
    payload: { ...parsed.payload, owner: diagnosis.owner },
    createdAt: now(),
  };
  store.actions.set(key, action);
  recordEvent(
    diagnosis.caseId,
    action.status === "WAITING" ? "WAITING" : "IN_RESOLUTION",
    "Consented simulated action recorded",
  );
  return action;
};

const artifactKind = (owner: OwnerType): StoredArtifact["kind"] =>
  owner === "EMPLOYER" ? "EMPLOYER" : owner === "BANK" ? "BANK" : "EPFO";

export const createHandoff = (input: unknown, idempotencyKey: string) => {
  const parsed = HandoffInputSchema.parse(input);
  const diagnosis = DiagnosisResultSchema.parse(parsed.diagnosis);
  const key = actionKey(diagnosis.caseId, idempotencyKey);
  const existing = store.handoffs.get(key);
  if (existing) return existing;
  if (parsed.simulateFailure) {
    throw new Error("ARTIFACT_GENERATION_RETRYABLE");
  }

  const kind = artifactKind(diagnosis.owner);
  const artifact: StoredArtifact = {
    id: id("artifact"),
    idempotencyKey,
    caseId: diagnosis.caseId,
    kind,
    payload: {
      ...parsed.payload,
      caseReference: diagnosis.caseId,
      owner: diagnosis.owner,
      simulated: true,
      submissionStatus: "NOT_SUBMITTED",
    },
    createdAt: now(),
  };
  store.handoffs.set(key, artifact);
  store.artifacts.set(artifact.id, artifact);
  recordEvent(
    diagnosis.caseId,
    "WAITING",
    `${kind} artifact created for simulated handoff`,
  );
  return artifact;
};

export const createReceipt = (
  diagnosisInput: unknown,
  idempotencyKey: string,
) => {
  const diagnosis = DiagnosisResultSchema.parse(diagnosisInput);
  const key = actionKey(diagnosis.caseId, idempotencyKey);
  const existing = store.artifacts.get(key);
  if (existing) return existing;
  const action = [...store.actions.values()]
    .reverse()
    .find((item) => item.caseId === diagnosis.caseId);
  const artifact: StoredArtifact = {
    id: id("receipt"),
    idempotencyKey,
    caseId: diagnosis.caseId,
    kind: "RECEIPT",
    payload: {
      title: "Nidhi Rakshak case summary",
      issue: diagnosis.problemSummary,
      firstDivergence: diagnosis.firstDivergence?.detail ?? "Not available",
      owner: diagnosis.owner,
      doNotTouch:
        diagnosis.doNotTouch.reason ?? "No change warning for this case.",
      nextAction: diagnosis.recommendedAction,
      evidence: diagnosis.evidence.map((item) => item.label),
      falsifier: diagnosis.falsifier ?? "No additional check is available.",
      currentState: action?.status ?? "NO_ACTION",
      simulated: "SIMULATED PROTOTYPE. No external submission occurred.",
    },
    createdAt: now(),
  };
  store.artifacts.set(key, artifact);
  recordEvent(diagnosis.caseId, "WAITING", "Stable simulated receipt created");
  return artifact;
};

export const getTracking = (caseId: string) => {
  const events = store.events.filter((event) => event.caseId === caseId);
  const action = [...store.actions.values()]
    .reverse()
    .find((item) => item.caseId === caseId);
  const handoff = [...store.handoffs.values()]
    .reverse()
    .find((item) => item.caseId === caseId);
  return {
    caseId,
    owner: handoff?.payload.owner ?? action?.payload.owner ?? "NONE",
    currentBlocker: action?.payload.issue ?? "No action recorded yet.",
    lastAction: action?.payload.nextAction ?? "No action recorded yet.",
    nextStep: handoff
      ? "The receiving party needs to review the simulated package."
      : (action?.payload.nextAction ?? "Review the diagnosis."),
    status: events.at(-1)?.toStatus ?? "DIAGNOSED",
    events,
    simulated: true,
  };
};

export interface RecheckDiagnosisProvider {
  getRecheck: (
    caseId: string,
    previous: DiagnosisResult,
  ) => Promise<RecheckResult>;
}

const fixtureProvider: RecheckDiagnosisProvider = {
  getRecheck: async (caseId, previous) => {
    if (caseId === "case-golden-fix-bank")
      return {
        outcome: "RESOLVED",
        diagnosisId: previous.diagnosisId,
        checkedAt: now(),
      };
    if (caseId === "case-golden-fight-relation-name")
      return { outcome: "SAME_BLOCKER", diagnosis: previous, checkedAt: now() };
    return {
      outcome: "NEW_BLOCKER",
      diagnosis: {
        ...previous,
        diagnosisId: `${previous.diagnosisId}-new`,
        version: previous.version + 1,
        problemSummary: "A different supported issue needs attention.",
        recommendedAction: "Review the new issue before taking action.",
      },
      checkedAt: now(),
    };
  },
};

export const recheckCase = async (
  input: unknown,
  idempotencyKey: string,
  provider = fixtureProvider,
) => {
  const parsed = RecheckInputSchema.parse(input);
  const previous = DiagnosisResultSchema.parse(parsed.diagnosis);
  const key = actionKey(previous.caseId, idempotencyKey);
  const existing = store.rechecks.get(key);
  if (existing) return existing;
  const result = await provider.getRecheck(previous.caseId, previous);
  store.rechecks.set(key, result);
  recordEvent(
    previous.caseId,
    result.outcome === "RESOLVED" ? "RESOLVED" : "IN_RESOLUTION",
    `Re-check outcome: ${result.outcome}`,
  );
  return result;
};

export const resetRecoveryStore = () => {
  store.actions.clear();
  store.handoffs.clear();
  store.artifacts.clear();
  store.events.length = 0;
  store.rechecks.clear();
};
