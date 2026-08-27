import { createHash } from "node:crypto";
import type { z } from "zod";
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

const ensureCase = async (caseId: string): Promise<CaseData | null> => {
  const existing = cases.get(caseId);
  if (existing) return existing;
  const provider = createDiagnosisApiProvider();
  if (!provider) return null;
  const diagnosis = await provider.getByCaseId(caseId);
  if (!diagnosis) return null;
  const data = fixtureContext(DiagnosisResult.parse(diagnosis));
  cases.set(caseId, data);
  return data;
};

export const getClaimCase = async (caseId: string) => ensureCase(caseId);

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
  const evidence = ContextEvidence.parse({
    ...parsed,
    evidenceId: `evidence-${stableUuid(key).slice(0, 12)}`,
  });
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
