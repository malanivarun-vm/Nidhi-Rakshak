import { z } from "zod";
import {
  type ClaimContextRepository,
  ClaimContextUnavailableError,
  loadDecodedClaimContext,
} from "./claim-context";
import { runDiagnosis } from "./diagnosis-pipeline";
import {
  type DiagnosisRunRepository,
  persistDiagnosisVersion,
} from "./diagnosis-repository";
import { RecordSnapshot } from "./record-comparison";

const runRequestSchema = z.object({
  caseId: z.string().trim().min(1).max(120),
  diagnosisId: z.string().trim().min(1).max(120),
  idempotencyKey: z.string().trim().min(1).max(200),
  recheck: z.boolean().default(false),
});

export interface RecordSnapshotRepository {
  findByCaseId(caseId: string): Promise<unknown>;
}

export class DiagnosisCaseNotFoundError extends Error {
  constructor() {
    super("The rescue case was not found.");
    this.name = "DiagnosisCaseNotFoundError";
  }
}

export class InvalidDiagnosisContextError extends Error {
  constructor() {
    super("The rescue case context is not valid for diagnosis.");
    this.name = "InvalidDiagnosisContextError";
  }
}

/**
 * Connects the A2/A3 read seams with the append-only A4 write seam. A future database
 * adapter supplies these repositories; this service owns no direct database client.
 */
export async function diagnoseCase(input: {
  caseId: string;
  diagnosisId: string;
  idempotencyKey: string;
  recheck?: boolean;
  claimContextRepository: ClaimContextRepository;
  recordSnapshotRepository: RecordSnapshotRepository;
  diagnosisRunRepository: DiagnosisRunRepository;
}) {
  const request = runRequestSchema.parse(input);
  const context = await loadDecodedClaimContext({
    caseId: request.caseId,
    repository: input.claimContextRepository,
  });

  if (context.kind === "NOT_FOUND") throw new DiagnosisCaseNotFoundError();
  if (context.kind === "INVALID_CONTEXT")
    throw new InvalidDiagnosisContextError();
  if (context.kind === "RETRYABLE_ERROR")
    throw new ClaimContextUnavailableError();

  const snapshots = z
    .array(RecordSnapshot)
    .parse(await input.recordSnapshotRepository.findByCaseId(request.caseId));
  const execution = runDiagnosis({
    caseId: request.caseId,
    diagnosisId: request.diagnosisId,
    context: context.context,
    snapshots,
  });

  return persistDiagnosisVersion({
    caseId: request.caseId,
    idempotencyKey: request.idempotencyKey,
    recheck: request.recheck,
    execution,
    repository: input.diagnosisRunRepository,
  });
}
