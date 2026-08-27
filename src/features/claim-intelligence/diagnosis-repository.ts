import { z } from "zod";
import {
  DiagnosisResult,
  type DiagnosisResult as DiagnosisResultType,
} from "../../domain/contracts";
import {
  DiagnosisBlocker,
  type DiagnosisExecution,
} from "./diagnosis-pipeline";

const persistInputSchema = z.object({
  caseId: z.string().trim().min(1).max(120),
  idempotencyKey: z.string().trim().min(1).max(200),
  recheck: z.boolean(),
  execution: z.object({
    result: DiagnosisResult,
    blockers: z.array(DiagnosisBlocker),
  }),
});

const persistedDiagnosisSchema = z.object({
  result: DiagnosisResult,
  blockers: z.array(DiagnosisBlocker),
  idempotencyKey: z.string().min(1),
});
export type PersistedDiagnosis = z.infer<typeof persistedDiagnosisSchema>;

export interface DiagnosisRunStore {
  findByIdempotencyKey(input: {
    caseId: string;
    idempotencyKey: string;
  }): Promise<unknown>;
  findLatestByCaseId(caseId: string): Promise<unknown>;
  append(input: PersistedDiagnosis): Promise<unknown>;
}

export interface DiagnosisRunRepository {
  /**
   * The adapter must run this callback atomically and serialize conflicting
   * `(caseId, idempotencyKey)` appends so a duplicate returns the original row.
   */
  transaction<T>(work: (store: DiagnosisRunStore) => Promise<T>): Promise<T>;
}

export class DiagnosisAlreadyExistsError extends Error {
  constructor() {
    super(
      "An initial diagnosis already exists; request a re-check to append a version.",
    );
    this.name = "DiagnosisAlreadyExistsError";
  }
}

function parsePersisted(value: unknown): PersistedDiagnosis | null {
  if (value === null) return null;
  return persistedDiagnosisSchema.parse(value);
}

/**
 * Persists only through a caller-supplied transaction. This leaves the frozen database
 * schema untouched while guaranteeing that duplicate keys replay and re-checks append.
 */
export async function persistDiagnosisVersion(input: {
  caseId: string;
  idempotencyKey: string;
  recheck: boolean;
  execution: DiagnosisExecution;
  repository: DiagnosisRunRepository;
}): Promise<DiagnosisResultType> {
  const request = persistInputSchema.parse(input);

  return input.repository.transaction(async (store) => {
    const replay = parsePersisted(
      await store.findByIdempotencyKey({
        caseId: request.caseId,
        idempotencyKey: request.idempotencyKey,
      }),
    );
    if (replay !== null) return replay.result;

    const latest = parsePersisted(
      await store.findLatestByCaseId(request.caseId),
    );
    if (latest !== null && !request.recheck)
      throw new DiagnosisAlreadyExistsError();

    const result = DiagnosisResult.parse({
      ...request.execution.result,
      caseId: request.caseId,
      version: latest === null ? 1 : latest.result.version + 1,
    });
    const persisted = persistedDiagnosisSchema.parse({
      result,
      blockers: request.execution.blockers,
      idempotencyKey: request.idempotencyKey,
    });
    const appended = parsePersisted(await store.append(persisted));
    if (appended === null)
      throw new Error(
        "Diagnosis repository did not return the appended result.",
      );

    return appended.result;
  });
}
