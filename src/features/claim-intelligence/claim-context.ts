import { z } from "zod";
import {
  ContextEvidence,
  type EvidenceGateResult,
  assessEvidenceSufficiency,
} from "./evidence-gate";
import {
  type RejectionContract,
  findRejectionContractByPattern,
  getRejectionContract,
} from "./rejection-registry";

const claimContextSchema = z.object({
  caseId: z.string().trim().min(1).max(120),
  claim: z.object({
    claimId: z.string().uuid(),
    externalRef: z.string().trim().min(1).max(80),
    claimType: z.string().trim().min(1).max(40),
    submittedAt: z.string().datetime(),
  }),
  rejection: z.object({
    rejectionId: z.string().uuid(),
    code: z.string().trim().min(1).max(80).nullable(),
    rawText: z.string().trim().min(1).max(4000),
  }),
  evidence: z.array(ContextEvidence),
});
export type ClaimContext = z.infer<typeof claimContextSchema>;

const loadInputSchema = z.object({ caseId: z.string().trim().min(1).max(120) });
const createInputSchema = z.object({
  claimId: z.string().uuid(),
  idempotencyKey: z.string().trim().min(1).max(200),
});

export interface ClaimContextRepository {
  findByCaseId(caseId: string): Promise<unknown>;
  findOrCreateByClaimId(input: {
    claimId: string;
    idempotencyKey: string;
  }): Promise<unknown>;
}

export class ClaimContextUnavailableError extends Error {
  constructor(message = "Claim context is temporarily unavailable") {
    super(message);
    this.name = "ClaimContextUnavailableError";
  }
}

export type RejectionDecoding =
  | { status: "SUPPORTED"; contract: RejectionContract }
  | { status: "UNSUPPORTED"; contract: null };

export type DecodedClaimContextResult =
  | {
      kind: "AVAILABLE";
      context: ClaimContext;
      decoding: RejectionDecoding;
      evidence: EvidenceGateResult;
    }
  | { kind: "NOT_FOUND" }
  | { kind: "INVALID_CONTEXT"; code: "CLAIM_CONTEXT_INVALID" }
  | { kind: "RETRYABLE_ERROR"; code: "CLAIM_CONTEXT_UNAVAILABLE" };

function decodeRejection(context: ClaimContext): RejectionDecoding {
  const contract =
    (context.rejection.code === null
      ? null
      : getRejectionContract(context.rejection.code)) ??
    findRejectionContractByPattern(context.rejection.rawText);

  if (
    contract === null ||
    contract.prototypeSupport === "DECLARED_UNSUPPORTED" ||
    contract.code === "UNMAPPED_REJECTION"
  )
    return { status: "UNSUPPORTED", contract: null };

  return { status: "SUPPORTED", contract };
}

function decodedResult(context: ClaimContext): DecodedClaimContextResult {
  const decoding = decodeRejection(context);
  const evidence: EvidenceGateResult =
    decoding.status === "UNSUPPORTED"
      ? { state: "UNKNOWN", missing: [], contradictions: [] }
      : assessEvidenceSufficiency({
          requirements: decoding.contract.evidenceRequired,
          evidence: context.evidence,
        });

  return { kind: "AVAILABLE", context, decoding, evidence };
}

async function parseRepositoryContext(
  read: () => Promise<unknown>,
): Promise<DecodedClaimContextResult> {
  try {
    const value = await read();
    if (value === null) return { kind: "NOT_FOUND" };

    const parsed = claimContextSchema.safeParse(value);
    if (!parsed.success)
      return { kind: "INVALID_CONTEXT", code: "CLAIM_CONTEXT_INVALID" };

    return decodedResult(parsed.data);
  } catch (error) {
    if (error instanceof ClaimContextUnavailableError)
      return { kind: "RETRYABLE_ERROR", code: "CLAIM_CONTEXT_UNAVAILABLE" };

    throw error;
  }
}

export async function loadDecodedClaimContext(input: {
  caseId: string;
  repository: ClaimContextRepository;
}): Promise<DecodedClaimContextResult> {
  const { caseId } = loadInputSchema.parse(input);
  return parseRepositoryContext(() => input.repository.findByCaseId(caseId));
}

export async function createRescueCaseContext(input: {
  claimId: string;
  idempotencyKey: string;
  repository: ClaimContextRepository;
}): Promise<DecodedClaimContextResult> {
  const { claimId, idempotencyKey } = createInputSchema.parse(input);
  return parseRepositoryContext(() =>
    input.repository.findOrCreateByClaimId({ claimId, idempotencyKey }),
  );
}
