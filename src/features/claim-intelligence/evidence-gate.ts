import { z } from "zod";
import type { EvidenceRequirement } from "./rejection-registry";

export const ContextEvidence = z.object({
  evidenceId: z.string().min(1),
  source: z.string().min(1),
  label: z.string().min(1),
  state: z.enum(["VERIFIED", "INFERRED", "UNKNOWN"]),
  observedAt: z.string().datetime().optional(),
  assertionKey: z.string().min(1).optional(),
  assertionValue: z.string().min(1).optional(),
});
export type ContextEvidence = z.infer<typeof ContextEvidence>;

export type EvidenceGateResult = {
  state: "SUFFICIENT" | "INSUFFICIENT" | "CONTRADICTORY" | "UNKNOWN";
  missing: string[];
  contradictions: string[];
};

function contradictionKeys(evidence: readonly ContextEvidence[]): string[] {
  const valuesByAssertion = new Map<string, Set<string>>();

  for (const item of evidence) {
    if (
      item.state !== "VERIFIED" ||
      item.assertionKey === undefined ||
      item.assertionValue === undefined
    )
      continue;

    const values =
      valuesByAssertion.get(item.assertionKey) ?? new Set<string>();
    values.add(item.assertionValue.trim().toLocaleUpperCase("en-US"));
    valuesByAssertion.set(item.assertionKey, values);
  }

  return [...valuesByAssertion.entries()]
    .filter(([, values]) => values.size > 1)
    .map(([assertionKey]) => assertionKey)
    .sort();
}

export function assessEvidenceSufficiency(input: {
  requirements: readonly EvidenceRequirement[];
  evidence: readonly ContextEvidence[];
}): EvidenceGateResult {
  const requirements = z
    .array(z.object({ source: z.string().min(1), label: z.string().min(1) }))
    .parse(input.requirements);
  const evidence = z.array(ContextEvidence).parse(input.evidence);
  const contradictions = contradictionKeys(evidence);

  if (contradictions.length > 0)
    return { state: "CONTRADICTORY", missing: [], contradictions };

  const missing = requirements
    .filter(
      (requirement) =>
        !evidence.some(
          (item) =>
            item.source === requirement.source && item.state === "VERIFIED",
        ),
    )
    .map((requirement) => requirement.source);

  if (missing.length > 0)
    return { state: "INSUFFICIENT", missing, contradictions: [] };

  return { state: "SUFFICIENT", missing: [], contradictions: [] };
}
