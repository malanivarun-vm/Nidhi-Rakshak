import {
  DiagnosisResult,
  type DiagnosisResult as DiagnosisResultType,
} from "../../domain/contracts";
import {
  type DiagnosisProvider,
  createDatabaseDiagnosisProvider,
  createFixtureDiagnosisProvider,
} from "./diagnosis-provider";
import { createDatabaseDiagnosisRepository } from "./drizzle-diagnosis-repository";

type Environment = Readonly<Record<string, string | undefined>>;

export type DiagnosisApiProvider = Pick<DiagnosisProvider, "getByCaseId">;

/**
 * Temporary A5 adapter. At I1, replace only this factory with the A4 database-backed
 * provider; the route envelope and the diagnosis screen continue to consume the frozen
 * DiagnosisResult contract unchanged.
 */
export function createDiagnosisApiProvider(
  environment: Environment = process.env,
): DiagnosisApiProvider | null {
  // Submission demo deliberately serves the four deterministic golden fixtures;
  // live database mode remains an explicit provider swap, never an LLM verdict.
  if (environment.NIDHI_FIXTURE_MODE === "true")
    return createFixtureDiagnosisProvider();

  const databaseUrl = environment.DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl.trim() === "") return null;

  return createDatabaseDiagnosisProvider(
    createDatabaseDiagnosisRepository(databaseUrl),
  );
}

export async function getFixtureDiagnosisForApi(input: {
  caseId: string;
  environment?: Environment;
}): Promise<DiagnosisResultType | null> {
  const provider = createDiagnosisApiProvider(input.environment);
  if (provider === null) return null;

  const diagnosis = await provider.getByCaseId(input.caseId);
  return diagnosis === null ? null : DiagnosisResult.parse(diagnosis);
}
