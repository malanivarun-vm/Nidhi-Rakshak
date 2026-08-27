import { asc, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "../../db";
import {
  caseArtifacts,
  caseStatusEvents,
  claims,
  diagnosisRuns,
  handoffs,
  proposedChanges,
  rescueCases,
  resolutionActions,
  simulations,
} from "../../db/schema";
import type { DiagnosisResult } from "../../domain/contracts";
import type {
  RecheckResult,
  StatusEvent,
  StoredAction,
  StoredArtifact,
} from "./recovery";
import type { SimulationResult } from "./simulation";

export interface ResolutionPersistence {
  saveSimulation: (
    diagnosis: DiagnosisResult,
    result: SimulationResult,
  ) => Promise<SimulationResult>;
  saveAction: (
    diagnosis: DiagnosisResult,
    action: StoredAction,
  ) => Promise<StoredAction>;
  saveHandoff: (
    diagnosis: DiagnosisResult,
    artifact: StoredArtifact,
  ) => Promise<StoredArtifact>;
  saveReceipt: (
    diagnosis: DiagnosisResult,
    artifact: StoredArtifact,
  ) => Promise<StoredArtifact>;
  getTracking: (caseId: string) => Promise<{
    events: StatusEvent[];
    action?: StoredAction;
    handoff?: StoredArtifact;
  }>;
  saveRecheck: (
    diagnosis: DiagnosisResult,
    result: RecheckResult,
  ) => Promise<RecheckResult>;
}

const syntheticUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const findRefs = async (diagnosis: DiagnosisResult) => {
  const db = getDatabase();
  if (!db) return undefined;
  const rows = await db
    .select({ caseDbId: rescueCases.id, diagnosisDbId: diagnosisRuns.id })
    .from(rescueCases)
    .innerJoin(diagnosisRuns, eq(diagnosisRuns.caseId, rescueCases.id))
    .where(
      syntheticUuid(diagnosis.caseId)
        ? eq(rescueCases.id, diagnosis.caseId)
        : sql`${diagnosisRuns.result}->>'caseId' = ${diagnosis.caseId} AND ${diagnosisRuns.result}->>'diagnosisId' = ${diagnosis.diagnosisId}`,
    )
    .limit(1);
  return rows[0];
};

const createDatabasePersistence = (): ResolutionPersistence => ({
  saveSimulation: async (diagnosis, result) => {
    const refs = await findRefs(diagnosis);
    if (!refs) return result;
    const db = getDatabase();
    if (!db) return result;
    await db.transaction(async (tx) => {
      const proposed = await tx
        .insert(proposedChanges)
        .values({
          caseId: refs.caseDbId,
          diagnosisId: refs.diagnosisDbId,
          beforeState: result.before,
          afterState: result.after,
        })
        .returning({ id: proposedChanges.id });
      await tx.insert(simulations).values({
        proposedChangeId: proposed[0].id,
        blockerDelta: result.blockerDelta,
        safe: result.safety === "SAFE",
        disclaimer: result.disclaimer,
      });
    });
    return result;
  },
  saveAction: async (diagnosis, action) => {
    const refs = await findRefs(diagnosis);
    if (!refs) return action;
    const db = getDatabase();
    if (!db) return action;
    const existing = await db
      .select()
      .from(resolutionActions)
      .where(eq(resolutionActions.idempotencyKey, action.idempotencyKey))
      .limit(1);
    if (existing[0])
      return {
        ...action,
        id: existing[0].id,
        payload: existing[0].payload as Record<string, string>,
        createdAt: existing[0].createdAt.toISOString(),
      };
    await db.transaction(async (tx) => {
      await tx.insert(resolutionActions).values({
        caseId: refs.caseDbId,
        actionType: action.actionType,
        status: action.status,
        idempotencyKey: action.idempotencyKey,
        payload: action.payload,
      });
      await tx.insert(caseStatusEvents).values({
        caseId: refs.caseDbId,
        toStatus: action.status === "WAITING" ? "WAITING" : "IN_RESOLUTION",
        reason: "Consented simulated action recorded",
      });
    });
    return action;
  },
  saveHandoff: async (diagnosis, artifact) => {
    const refs = await findRefs(diagnosis);
    if (!refs) return artifact;
    const db = getDatabase();
    if (!db) return artifact;
    await db.transaction(async (tx) => {
      await tx.insert(handoffs).values({
        caseId: refs.caseDbId,
        owner: diagnosis.owner,
        payload: artifact.payload,
        consentedAt: new Date(),
      });
      await tx.insert(caseArtifacts).values({
        caseId: refs.caseDbId,
        kind: artifact.kind,
        payload: artifact.payload,
      });
      await tx.insert(caseStatusEvents).values({
        caseId: refs.caseDbId,
        toStatus: "WAITING",
        reason: `${artifact.kind} artifact created for simulated handoff`,
      });
    });
    return artifact;
  },
  saveReceipt: async (diagnosis, artifact) => {
    const refs = await findRefs(diagnosis);
    if (!refs) return artifact;
    const db = getDatabase();
    if (!db) return artifact;
    await db.transaction(async (tx) => {
      await tx.insert(caseArtifacts).values({
        caseId: refs.caseDbId,
        kind: "RECEIPT",
        payload: artifact.payload,
      });
      await tx.insert(caseStatusEvents).values({
        caseId: refs.caseDbId,
        toStatus: "WAITING",
        reason: "Stable simulated receipt created",
      });
    });
    return artifact;
  },
  getTracking: async (caseId) => {
    const db = getDatabase();
    if (!db) return { events: [] };
    const caseRows = await db
      .select({ id: rescueCases.id })
      .from(rescueCases)
      .innerJoin(claims, eq(claims.id, rescueCases.claimId))
      .where(
        syntheticUuid(caseId)
          ? eq(rescueCases.id, caseId)
          : eq(claims.externalRef, `${caseId}-claim`),
      )
      .limit(1);
    const caseDbId = caseRows[0]?.id;
    if (!caseDbId) return { events: [] };
    const events = await db
      .select()
      .from(caseStatusEvents)
      .where(eq(caseStatusEvents.caseId, caseDbId))
      .orderBy(asc(caseStatusEvents.createdAt));
    const actions = await db
      .select()
      .from(resolutionActions)
      .where(eq(resolutionActions.caseId, caseDbId))
      .orderBy(desc(resolutionActions.createdAt))
      .limit(1);
    const forwards = await db
      .select()
      .from(handoffs)
      .where(eq(handoffs.caseId, caseDbId))
      .orderBy(desc(handoffs.createdAt))
      .limit(1);
    return {
      events: events.map((event) => ({
        id: event.id,
        caseId,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        reason: event.reason,
        createdAt: event.createdAt.toISOString(),
      })),
      action: actions[0]
        ? {
            id: actions[0].id,
            caseId,
            diagnosisId: "database-diagnosis",
            idempotencyKey: actions[0].idempotencyKey,
            actionType: actions[0].actionType as StoredAction["actionType"],
            status: actions[0].status as StoredAction["status"],
            consent: { approved: true, text: "Stored consent" },
            payload: actions[0].payload as Record<string, string>,
            createdAt: actions[0].createdAt.toISOString(),
          }
        : undefined,
      handoff: forwards[0]
        ? {
            id: forwards[0].id,
            idempotencyKey: undefined,
            caseId,
            kind: forwards[0].owner as StoredArtifact["kind"],
            payload: forwards[0].payload as Record<string, unknown>,
            createdAt: forwards[0].createdAt.toISOString(),
          }
        : undefined,
    };
  },
  saveRecheck: async (diagnosis, result) => {
    const refs = await findRefs(diagnosis);
    if (!refs) return result;
    const db = getDatabase();
    if (!db) return result;
    await db
      .update(rescueCases)
      .set({
        status: result.outcome === "RESOLVED" ? "RESOLVED" : "IN_RESOLUTION",
        updatedAt: new Date(),
      })
      .where(eq(rescueCases.id, refs.caseDbId));
    await db.insert(caseStatusEvents).values({
      caseId: refs.caseDbId,
      toStatus: result.outcome === "RESOLVED" ? "RESOLVED" : "IN_RESOLUTION",
      reason: `Re-check outcome: ${result.outcome}`,
    });
    return result;
  },
});

export const databasePersistence = createDatabasePersistence();
