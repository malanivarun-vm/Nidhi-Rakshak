import { z } from "zod";
import {
  type DiagnosisResult,
  DiagnosisResult as DiagnosisResultSchema,
} from "../../domain/contracts";

const StateSchema = z.object({
  supportedBlockerCount: z.number().int().nonnegative(),
});

export const ProposedChangeSchema = z.object({
  field: z.string().min(1),
  before: z.string(),
  after: z.string(),
});

export const SimulationInputSchema = z.object({
  proposedChange: ProposedChangeSchema,
  before: StateSchema,
  after: StateSchema,
});
export type SimulationInput = z.infer<typeof SimulationInputSchema>;

export const SimulationResultSchema = z.object({
  caseId: z.string().min(1),
  diagnosisId: z.string().min(1),
  proposedChange: ProposedChangeSchema,
  before: StateSchema,
  after: StateSchema,
  blockerDelta: z.object({
    before: z.number().int().nonnegative(),
    after: z.number().int().nonnegative(),
    change: z.number().int(),
  }),
  safety: z.enum(["SAFE", "UNSAFE", "NOT_AVAILABLE"]),
  safetyResult: z.string().min(1),
  recommendation: z.string().min(1),
  disclaimer: z.literal(
    "This simulation checks only the supported blockers. It does not predict claim approval or confirm an external change.",
  ),
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

const disclaimer =
  "This simulation checks only the supported blockers. It does not predict claim approval or confirm an external change." as const;

export const simulateChange = (
  diagnosisInput: unknown,
  simulationInput: unknown,
): SimulationResult => {
  const diagnosis = DiagnosisResultSchema.parse(diagnosisInput);
  const input = SimulationInputSchema.parse(simulationInput);
  const beforeCount = input.before.supportedBlockerCount;
  const afterCount = input.after.supportedBlockerCount;
  const change = afterCount - beforeCount;
  const hasActionableVerdict =
    diagnosis.status === "DIAGNOSED" &&
    diagnosis.verdict !== undefined &&
    diagnosis.verdict !== "NONE";
  const doNotTouchViolated =
    diagnosis.doNotTouch.applies &&
    input.proposedChange.before !== input.proposedChange.after;
  const unsafe = !hasActionableVerdict || doNotTouchViolated || change > 0;
  const safety = !hasActionableVerdict
    ? "NOT_AVAILABLE"
    : unsafe
      ? "UNSAFE"
      : "SAFE";

  return SimulationResultSchema.parse({
    caseId: diagnosis.caseId,
    diagnosisId: diagnosis.diagnosisId,
    proposedChange: input.proposedChange,
    before: input.before,
    after: input.after,
    blockerDelta: { before: beforeCount, after: afterCount, change },
    safety,
    safetyResult: !hasActionableVerdict
      ? "We need more evidence before a change can be simulated safely."
      : doNotTouchViolated
        ? "This change would alter a detail the diagnosis says to keep."
        : change > 0
          ? "This change creates more supported blockers."
          : change < 0
            ? "This change clears the supported blocker movement shown here."
            : "This change does not change the supported blockers shown here.",
    recommendation: !hasActionableVerdict
      ? "Do not make this change. Get more evidence first."
      : unsafe
        ? "Do not make this change."
        : diagnosis.recommendedAction,
    disclaimer,
  });
};

export const createSimulationService = () => {
  const results = new Map<string, SimulationResult>();

  return {
    simulate: (
      diagnosis: DiagnosisResult,
      input: SimulationInput,
      idempotencyKey: string,
    ): SimulationResult => {
      const existing = results.get(idempotencyKey);
      if (existing) return existing;
      const result = simulateChange(diagnosis, input);
      results.set(idempotencyKey, result);
      return result;
    },
  };
};
