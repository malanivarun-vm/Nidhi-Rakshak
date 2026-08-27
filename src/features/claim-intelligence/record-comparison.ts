import { z } from "zod";
import type { DecodedClaimContextResult } from "./claim-context";

const provenanceState = z.enum(["VERIFIED", "INFERRED", "UNKNOWN"]);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const RecordObservation = z.object({
  field: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(1000).nullable(),
  label: z.string().trim().min(1).max(160),
  state: provenanceState,
  reference: z.boolean().default(false),
  effectiveOn: calendarDate.optional(),
  observedAt: z.string().datetime().optional(),
});
export type RecordObservation = z.infer<typeof RecordObservation>;

export const ServiceTimelineObservation = z.object({
  occurredOn: calendarDate,
  label: z.string().trim().min(1).max(240),
  state: provenanceState,
});
export type ServiceTimelineObservation = z.infer<
  typeof ServiceTimelineObservation
>;

export const RecordSnapshot = z.object({
  source: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(160),
  capturedAt: z.string().datetime(),
  observations: z.array(RecordObservation),
  timelineEvents: z.array(ServiceTimelineObservation),
});
export type RecordSnapshot = z.input<typeof RecordSnapshot>;
type ParsedRecordSnapshot = z.output<typeof RecordSnapshot>;

export type ComparedObservation = RecordObservation & {
  source: string;
  recordLabel: string;
  capturedAt: string;
};

export type ComparedField = {
  field: string;
  state: "MATCH" | "DIVERGENT" | "OBSERVED" | "INSUFFICIENT" | "CONTRADICTORY";
  observations: ComparedObservation[];
  evidenceSources: string[];
};

export type ReadyRecordComparison = {
  state: "READY";
  rejectionCode: string;
  includedSources: string[];
  excludedSources: string[];
  fields: ComparedField[];
  snapshots: ParsedRecordSnapshot[];
  evidenceState: "SUFFICIENT";
};

export type SafeRecordComparison = {
  state:
    | "INSUFFICIENT"
    | "CONTRADICTORY"
    | "UNKNOWN"
    | "UNSUPPORTED"
    | "NOT_APPLICABLE";
  includedSources: string[];
  excludedSources: string[];
  fields: [];
  evidenceState: "INSUFFICIENT" | "CONTRADICTORY" | "UNKNOWN" | "SUFFICIENT";
  requiredSources?: string[];
};

export type RecordComparisonResult =
  | ReadyRecordComparison
  | SafeRecordComparison;

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function normalizedValue(value: string): string {
  return value.trim().toLocaleUpperCase("en-US");
}

function comparisonValue(value: string | null): string {
  return value === null ? "MISSING" : `VALUE:${normalizedValue(value)}`;
}

function observationOrder(
  left: ComparedObservation,
  right: ComparedObservation,
) {
  const leftWhen = left.effectiveOn ?? left.observedAt ?? left.capturedAt;
  const rightWhen = right.effectiveOn ?? right.observedAt ?? right.capturedAt;

  return (
    leftWhen.localeCompare(rightWhen) ||
    left.source.localeCompare(right.source) ||
    left.label.localeCompare(right.label)
  );
}

function safeResult(
  state: SafeRecordComparison["state"],
  evidenceState: SafeRecordComparison["evidenceState"],
  requiredSources?: string[],
): SafeRecordComparison {
  return {
    state,
    includedSources: [],
    excludedSources: [],
    fields: [],
    evidenceState,
    ...(requiredSources === undefined ? {} : { requiredSources }),
  };
}

function fieldState(
  observations: readonly ComparedObservation[],
): ComparedField["state"] {
  const verified = observations.filter(
    (observation) => observation.state === "VERIFIED",
  );
  const values = new Set(
    verified.map((observation) => comparisonValue(observation.value)),
  );
  const valuesBySource = new Map<string, Set<string>>();

  for (const observation of verified) {
    const sourceValues =
      valuesBySource.get(observation.source) ?? new Set<string>();
    sourceValues.add(comparisonValue(observation.value));
    valuesBySource.set(observation.source, sourceValues);
  }

  if (
    [...valuesBySource.values()].some((sourceValues) => sourceValues.size > 1)
  )
    return "CONTRADICTORY";
  if (values.size > 1) return "DIVERGENT";
  if (new Set(verified.map((observation) => observation.source)).size > 1)
    return "MATCH";
  if (observations.some((observation) => observation.state === "VERIFIED"))
    return "OBSERVED";
  return "INSUFFICIENT";
}

function compareFields(
  snapshots: readonly ParsedRecordSnapshot[],
  sourceOrder: readonly string[],
): ComparedField[] {
  const observationsByField = new Map<string, ComparedObservation[]>();

  for (const snapshot of snapshots) {
    for (const observation of snapshot.observations) {
      const observations = observationsByField.get(observation.field) ?? [];
      observations.push({
        ...observation,
        source: snapshot.source,
        recordLabel: snapshot.label,
        capturedAt: snapshot.capturedAt,
      });
      observationsByField.set(observation.field, observations);
    }
  }

  return [...observationsByField.entries()]
    .map(([field, observations]) => {
      const sorted = [...observations].sort(observationOrder);
      const evidenceSources = sourceOrder.filter((source) =>
        sorted.some((observation) => observation.source === source),
      );

      return {
        field,
        state: fieldState(sorted),
        observations: sorted,
        evidenceSources,
      };
    })
    .sort((left, right) => left.field.localeCompare(right.field));
}

/**
 * Filters snapshots to the record sources declared by the decoded rejection contract.
 * It treats A2's unsupported and evidence-gated states as successful, non-diagnostic
 * intermediate states rather than manufacturing a comparison from incomplete records.
 */
export function compareRelevantRecords(input: {
  context: DecodedClaimContextResult;
  snapshots: readonly RecordSnapshot[];
}): RecordComparisonResult {
  const snapshots = z.array(RecordSnapshot).parse(input.snapshots);
  const { context } = input;

  if (context.kind !== "AVAILABLE") return safeResult("UNKNOWN", "UNKNOWN");
  if (context.decoding.status === "UNSUPPORTED")
    return safeResult("UNSUPPORTED", "UNKNOWN");
  if (context.evidence.state !== "SUFFICIENT")
    return safeResult(context.evidence.state, context.evidence.state);

  const requiredSources = unique(context.decoding.contract.recordsToCompare);
  if (requiredSources.length === 0)
    return safeResult("NOT_APPLICABLE", "SUFFICIENT");

  const includedSources = requiredSources.filter((source) =>
    snapshots.some((snapshot) => snapshot.source === source),
  );
  const excludedSources = unique(
    snapshots
      .filter((snapshot) => !requiredSources.includes(snapshot.source))
      .map((snapshot) => snapshot.source),
  ).sort();

  if (includedSources.length !== requiredSources.length)
    return {
      ...safeResult("UNKNOWN", "SUFFICIENT", requiredSources),
      excludedSources,
    };

  const relevantSnapshots = snapshots.filter((snapshot) =>
    requiredSources.includes(snapshot.source),
  );

  const fields = compareFields(relevantSnapshots, requiredSources);
  if (fields.some((field) => field.state === "CONTRADICTORY"))
    return safeResult("CONTRADICTORY", "CONTRADICTORY");

  return {
    state: "READY",
    rejectionCode: context.decoding.contract.code,
    includedSources,
    excludedSources,
    fields,
    snapshots: relevantSnapshots,
    evidenceState: "SUFFICIENT",
  };
}

export type MoolResult =
  | {
      state: "AVAILABLE";
      firstDivergence: { label: string; source: string; detail: string };
    }
  | { state: "UNAVAILABLE" };

/**
 * Mool identifies an observed difference from an explicitly supplied reference record.
 * It deliberately reports no actor or causal explanation: a divergent record is not
 * proof of who created the divergence.
 */
export function deriveMool(comparison: RecordComparisonResult): MoolResult {
  if (comparison.state !== "READY") return { state: "UNAVAILABLE" };

  const candidates = comparison.fields
    .filter((field) => field.state === "DIVERGENT")
    .flatMap((field) => {
      const references = field.observations.filter(
        (observation) =>
          observation.reference &&
          observation.state === "VERIFIED" &&
          observation.value !== null,
      );
      const referenceValues = new Set(
        references.map((observation) =>
          normalizedValue(observation.value ?? ""),
        ),
      );

      if (referenceValues.size !== 1) return [];

      return field.observations
        .filter(
          (observation) =>
            observation.state === "VERIFIED" &&
            observation.value !== null &&
            normalizedValue(observation.value) !== [...referenceValues][0],
        )
        .map((observation) => ({ field: field.field, observation }));
    })
    .sort(
      (left, right) =>
        observationOrder(left.observation, right.observation) ||
        left.field.localeCompare(right.field),
    );

  const first = candidates[0];
  if (first === undefined) return { state: "UNAVAILABLE" };

  return {
    state: "AVAILABLE",
    firstDivergence: {
      label: first.observation.recordLabel,
      source: first.observation.source,
      detail: `The verified ${first.field} value differs from the verified reference records.`,
    },
  };
}
