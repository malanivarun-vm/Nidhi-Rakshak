import { NextResponse } from "next/server";
import { DiagnosisResult as DiagnosisResultSchema } from "../../../../../src/domain/contracts";
import { databasePersistence } from "../../../../../src/features/resolution-recovery/persistence";
import { getResolutionDiagnosis } from "../../../../../src/features/resolution-recovery/provider";
import {
  SimulationInputSchema,
  createSimulationService,
} from "../../../../../src/features/resolution-recovery/simulation";

interface SimulationRouteContext {
  params: Promise<{ caseId: string }>;
}

const simulationService = createSimulationService();

export const POST = async (
  request: Request,
  context: SimulationRouteContext,
) => {
  const { caseId } = await context.params;
  const diagnosis = await getResolutionDiagnosis(caseId);
  const requestId = crypto.randomUUID();

  if (!diagnosis) {
    return NextResponse.json(
      {
        error: {
          code: "RESOLUTION_CASE_NOT_FOUND",
          message: "Resolution case was not found.",
          retryable: false,
          requestId,
        },
      },
      { status: 404 },
    );
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    requestBody = undefined;
  }

  const parsedBody = SimulationInputSchema.safeParse(requestBody);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_SIMULATION",
          message:
            "The proposed change and supported blocker states are invalid.",
          retryable: false,
          requestId,
        },
      },
      { status: 400 },
    );
  }

  const validatedDiagnosis = DiagnosisResultSchema.parse(diagnosis);
  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    return NextResponse.json(
      {
        error: {
          code: "IDEMPOTENCY_KEY_REQUIRED",
          message: "A simulation key is required.",
          retryable: false,
          requestId,
        },
      },
      { status: 400 },
    );
  }

  const simulation = simulationService.simulate(
    validatedDiagnosis,
    parsedBody.data,
    `${caseId}:${idempotencyKey}`,
  );
  await databasePersistence.saveSimulation(validatedDiagnosis, simulation);
  return NextResponse.json({
    data: {
      simulation,
    },
  });
};
