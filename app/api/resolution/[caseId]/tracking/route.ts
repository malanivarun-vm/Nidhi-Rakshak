import { NextResponse } from "next/server";
import { databasePersistence } from "../../../../../src/features/resolution-recovery/persistence";
import { getTracking } from "../../../../../src/features/resolution-recovery/recovery";

export const GET = async (
  _request: Request,
  context: { params: Promise<{ caseId: string }> },
) => {
  const { caseId } = await context.params;
  const local = getTracking(caseId);
  const persisted = await databasePersistence.getTracking(caseId);
  return NextResponse.json({
    data: {
      tracking: persisted.events.length
        ? {
            ...local,
            events: persisted.events,
            action: persisted.action,
            handoff: persisted.handoff,
            receipt: persisted.receipt,
            recheck: persisted.recheck,
            status: persisted.events.at(-1)?.toStatus ?? local.status,
          }
        : local,
    },
  });
};
