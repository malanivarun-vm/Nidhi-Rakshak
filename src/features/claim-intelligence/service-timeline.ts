import type { RecordComparisonResult } from "./record-comparison";

export type ServiceTimelineResult =
  | {
      state: "AVAILABLE";
      events: Array<{
        occurredOn: string;
        label: string;
        source: string;
        state: "VERIFIED" | "INFERRED" | "UNKNOWN";
      }>;
    }
  | { state: "NOT_APPLICABLE" | "UNAVAILABLE"; events: [] };

/**
 * Produces a chronological view of only service-history events that survived the
 * contract scope filter. Inferred and unknown events remain labelled as such.
 */
export function deriveServiceTimeline(
  comparison: RecordComparisonResult,
): ServiceTimelineResult {
  if (comparison.state !== "READY") return { state: "UNAVAILABLE", events: [] };

  const serviceSnapshots = comparison.snapshots.filter(
    (snapshot) => snapshot.source === "service_history",
  );
  if (serviceSnapshots.length === 0)
    return { state: "NOT_APPLICABLE", events: [] };

  return {
    state: "AVAILABLE",
    events: serviceSnapshots
      .flatMap((snapshot) =>
        snapshot.timelineEvents.map((event) => ({
          ...event,
          source: snapshot.source,
        })),
      )
      .sort(
        (left, right) =>
          left.occurredOn.localeCompare(right.occurredOn) ||
          left.source.localeCompare(right.source) ||
          left.label.localeCompare(right.label),
      ),
  };
}
