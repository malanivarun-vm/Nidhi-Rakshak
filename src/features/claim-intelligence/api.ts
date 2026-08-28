import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import type { z } from "zod";
import { getDatabase } from "../../db";
import {
  claimRejections,
  claims,
  diagnosisRuns,
  evidenceItems,
  rescueCases,
} from "../../db/schema";
import {
  DiagnosisResult,
  type DiagnosisResult as DiagnosisResultType,
} from "../../domain/contracts";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";
import { type ClaimContext, ClaimContextSchema } from "./claim-context";
import { createDiagnosisApiProvider } from "./diagnosis-api-provider";
import { ContextEvidence } from "./evidence-gate";

const evidenceInputSchema = ContextEvidence.pick({
  source: true,
  label: true,
  state: true,
  observedAt: true,
  assertionKey: true,
  assertionValue: true,
});

type CaseData = {
  diagnosis: DiagnosisResultType;
  context: ClaimContext;
  evidence: z.infer<typeof ContextEvidence>[];
};

type PersistedEvidence = {
  evidence: z.infer<typeof ContextEvidence>;
  idempotencyKey?: string;
};

const cases = new Map<string, CaseData>();
const diagnosisKeys = new Map<string, DiagnosisResultType>();
const evidenceKeys = new Map<string, z.infer<typeof ContextEvidence>>();

export const stableUuid = (value: string, offset = 0) => {
  const hex = createHash("sha256").update(`${value}:${offset}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const fixtureContext = (diagnosis: DiagnosisResultType): CaseData => {
  const evidence = diagnosis.evidence.map((item) =>
    ContextEvidence.parse(item),
  );
  const context = ClaimContextSchema.parse({
    caseId: diagnosis.caseId,
    claim: {
      claimId: stableUuid(diagnosis.caseId),
      externalRef: `${diagnosis.caseId}-claim`,
      claimType: "WITHDRAWAL",
      submittedAt: "2026-08-27T00:00:00.000Z",
    },
    rejection: {
      rejectionId: stableUuid(diagnosis.caseId, 1),
      code: diagnosis.rejectionCode,
      rawText: `Synthetic rejection for ${diagnosis.rejectionCode}`,
    },
    evidence,
  });
  return { diagnosis, context, evidence };
};

const persistedCase = async (caseId: string) => {
  const database = getDatabase();
  if (!database) return undefined;
  const rows = await database
    .select({ caseId: rescueCases.id })
    .from(rescueCases)
    .innerJoin(diagnosisRuns, eq(diagnosisRuns.caseId, rescueCases.id))
    .where(sql`${diagnosisRuns.result}->>'caseId' = ${caseId}`)
    .limit(1);
  const caseRecord = rows[0];
  return caseRecord ? { database, caseId: caseRecord.caseId } : undefined;
};

const readPersistedEvidence = async (
  caseId: string,
): Promise<PersistedEvidence[]> => {
  const stored = await persistedCase(caseId);
  if (!stored) return [];
  const rows = await stored.database
    .select({
      id: evidenceItems.id,
      source: evidenceItems.source,
      label: evidenceItems.label,
      state: evidenceItems.state,
      provenance: evidenceItems.provenance,
    })
    .from(evidenceItems)
    .where(
      and(
        eq(evidenceItems.caseId, stored.caseId),
        sql`${evidenceItems.provenance}->>'nidhiRakshakUpload' = 'true'`,
      ),
    );

  return rows.map((row) => {
    const provenance =
      typeof row.provenance === "object" && row.provenance !== null
        ? row.provenance
        : {};
    const value = (key: string) =>
      typeof provenance[key as keyof typeof provenance] === "string"
        ? (provenance[key as keyof typeof provenance] as string)
        : undefined;
    return {
      evidence: ContextEvidence.parse({
        evidenceId: row.id,
        source: row.source,
        label: row.label,
        state: row.state,
        observedAt: value("observedAt"),
        assertionKey: value("assertionKey"),
        assertionValue: value("assertionValue"),
      }),
      idempotencyKey: value("idempotencyKey"),
    };
  });
};

const ensureCase = async (caseId: string): Promise<CaseData | null> => {
  const existing = cases.get(caseId);
  if (existing) return existing;
  const provider = createDiagnosisApiProvider();
  if (!provider) return null;
  const diagnosis = await provider.getByCaseId(caseId);
  if (!diagnosis) return null;
  const data = fixtureContext(DiagnosisResult.parse(diagnosis));
  const uploadedEvidence =
    process.env.NIDHI_FIXTURE_MODE === "true"
      ? []
      : await readPersistedEvidence(caseId);
  if (uploadedEvidence.length > 0) {
    data.evidence.push(...uploadedEvidence.map((item) => item.evidence));
    data.context = ClaimContextSchema.parse({
      ...data.context,
      evidence: data.evidence,
    });
  }
  cases.set(caseId, data);
  return data;
};

export const getClaimCase = async (caseId: string) => ensureCase(caseId);

export const getClaimContextByClaimId = async (claimId: string) => {
  const fixtureCaseId = fixtureCaseIds.find(
    (caseId) => stableUuid(caseId) === claimId,
  );
  if (fixtureCaseId) {
    const data = await getClaimCase(fixtureCaseId);
    return data?.context ?? null;
  }

  const database = getDatabase();
  if (!database) return null;

  const [row] = await database
    .select({
      caseId: rescueCases.id,
      claimId: claims.id,
      externalRef: claims.externalRef,
      claimType: claims.claimType,
      submittedAt: claims.submittedAt,
      rejectionId: claimRejections.id,
      rejectionCode: claimRejections.code,
      rejectionText: claimRejections.rawText,
    })
    .from(rescueCases)
    .innerJoin(claims, eq(rescueCases.claimId, claims.id))
    .innerJoin(claimRejections, eq(rescueCases.rejectionId, claimRejections.id))
    .where(eq(claims.id, claimId))
    .limit(1);

  if (!row) return null;

  const evidence = await database
    .select({
      evidenceId: evidenceItems.id,
      source: evidenceItems.source,
      label: evidenceItems.label,
      state: evidenceItems.state,
    })
    .from(evidenceItems)
    .where(eq(evidenceItems.caseId, row.caseId));

  return ClaimContextSchema.parse({
    caseId: row.caseId,
    claim: {
      claimId: row.claimId,
      externalRef: row.externalRef,
      claimType: row.claimType,
      submittedAt: row.submittedAt.toISOString(),
    },
    rejection: {
      rejectionId: row.rejectionId,
      code: row.rejectionCode,
      rawText: row.rejectionText,
    },
    evidence: evidence.map((item) =>
      ContextEvidence.parse({
        evidenceId: item.evidenceId,
        source: item.source,
        label: item.label,
        state: item.state,
      }),
    ),
  });
};

export const createClaimCase = async (input: {
  caseId: string;
  idempotencyKey: string;
}) => {
  const key = `${input.caseId}:${input.idempotencyKey}`;
  const replay = diagnosisKeys.get(key);
  const data = await ensureCase(input.caseId);
  if (!data) return null;
  if (replay) return { case: data, replay: true };
  diagnosisKeys.set(key, data.diagnosis);
  return { case: data, replay: false };
};

export const diagnoseClaimCase = async (
  caseId: string,
  idempotencyKey: string,
) => {
  const data = await ensureCase(caseId);
  if (!data) return null;
  const key = `${caseId}:${idempotencyKey}`;
  const replay = diagnosisKeys.get(key);
  if (replay) return replay;
  diagnosisKeys.set(key, data.diagnosis);
  return data.diagnosis;
};

export const addClaimEvidence = async (
  caseId: string,
  idempotencyKey: string,
  input: unknown,
) => {
  const data = await ensureCase(caseId);
  if (!data) return null;
  const parsed = evidenceInputSchema.parse(input);
  const key = `${caseId}:${idempotencyKey}`;
  const replay = evidenceKeys.get(key);
  if (replay) return replay;
  const persisted = await readPersistedEvidence(caseId);
  const existing = persisted.find((item) => item.idempotencyKey === key);
  if (existing) {
    evidenceKeys.set(key, existing.evidence);
    return existing.evidence;
  }
  let evidence = ContextEvidence.parse({
    ...parsed,
    evidenceId: `evidence-${stableUuid(key).slice(0, 12)}`,
  });
  const stored = await persistedCase(caseId);
  if (stored) {
    const inserted = await stored.database
      .insert(evidenceItems)
      .values({
        caseId: stored.caseId,
        source: evidence.source,
        label: evidence.label,
        state: evidence.state,
        provenance: {
          observedAt: evidence.observedAt,
          assertionKey: evidence.assertionKey,
          assertionValue: evidence.assertionValue,
          idempotencyKey: key,
          nidhiRakshakUpload: true,
        },
      })
      .returning({ id: evidenceItems.id });
    evidence = ContextEvidence.parse({
      ...evidence,
      evidenceId: inserted[0].id,
    });
  }
  data.evidence.push(evidence);
  data.context = ClaimContextSchema.parse({
    ...data.context,
    evidence: data.evidence,
  });
  evidenceKeys.set(key, evidence);
  return evidence;
};

export const resetClaimApiStore = () => {
  cases.clear();
  diagnosisKeys.clear();
  evidenceKeys.clear();
};

export const fixtureCaseIds = Object.values(GOLDEN_FIXTURES).map(
  (item) => item.caseId,
);
