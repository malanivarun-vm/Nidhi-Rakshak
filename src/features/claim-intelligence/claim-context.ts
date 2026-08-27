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

export const ClaimContextSchema = z.object({
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
export type ClaimContext = z.infer<typeof ClaimContextSchema>;

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

export type AvailableDecodedClaimContext = Extract<
  DecodedClaimContextResult,
  { kind: "AVAILABLE" }
>;

export function decodeClaimContext(
  context: ClaimContext,
): AvailableDecodedClaimContext {
  const parsed = ClaimContextSchema.parse(context);
  const contract =
    (parsed.rejection.code === null
      ? null
      : getRejectionContract(parsed.rejection.code)) ??
    findRejectionContractByPattern(parsed.rejection.rawText);

  if (
    contract === null ||
    contract.prototypeSupport === "DECLARED_UNSUPPORTED" ||
    contract.code === "UNMAPPED_REJECTION"
  )
    return {
      kind: "AVAILABLE",
      context: parsed,
      decoding: { status: "UNSUPPORTED", contract: null },
      evidence: { state: "UNKNOWN", missing: [], contradictions: [] },
    };

  const evidence: EvidenceGateResult = assessEvidenceSufficiency({
    requirements: contract.evidenceRequired,
    evidence: parsed.evidence,
  });

  return {
    kind: "AVAILABLE",
    context: parsed,
    decoding: { status: "SUPPORTED", contract },
    evidence,
  };
}

async function parseRepositoryContext(
  read: () => Promise<unknown>,
): Promise<DecodedClaimContextResult> {
  try {
    const value = await read();
    if (value === null) return { kind: "NOT_FOUND" };

    const parsed = ClaimContextSchema.safeParse(value);
    if (!parsed.success)
      return { kind: "INVALID_CONTEXT", code: "CLAIM_CONTEXT_INVALID" };

    return decodeClaimContext(parsed.data);
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
