import { desc, sql } from "drizzle-orm";
import { getDatabase } from "../../db";
import { diagnosisRuns } from "../../db/schema";
import type { DiagnosisResult } from "../../domain/contracts";
import { DiagnosisResult as DiagnosisResultSchema } from "../../domain/contracts";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";

export interface ResolutionDiagnosisProvider {
  getDiagnosis: (caseId: string) => Promise<DiagnosisResult | undefined>;
}

const fixtureByCaseId = new Map(
  Object.values(GOLDEN_FIXTURES).map((fixture) => [fixture.caseId, fixture]),
);

export const fixtureResolutionDiagnosisProvider: ResolutionDiagnosisProvider = {
  getDiagnosis: async (caseId) => {
    const fixture = fixtureByCaseId.get(caseId);

    return fixture ? DiagnosisResultSchema.parse(fixture) : undefined;
  },
};

export const databaseResolutionDiagnosisProvider: ResolutionDiagnosisProvider =
  {
    getDiagnosis: async (caseId) => {
      const db = getDatabase();
      if (!db) return undefined;
      const rows = await db
        .select({ result: diagnosisRuns.result })
        .from(diagnosisRuns)
        .where(sql`${diagnosisRuns.result}->>'caseId' = ${caseId}`)
        .orderBy(desc(diagnosisRuns.version))
        .limit(1);
      if (!rows[0]) return undefined;
      const parsed = DiagnosisResultSchema.safeParse(rows[0].result);
      return parsed.success ? parsed.data : undefined;
    },
  };

export const getResolutionDiagnosis = (caseId: string) =>
  process.env.NIDHI_FIXTURE_MODE === "false"
    ? databaseResolutionDiagnosisProvider.getDiagnosis(caseId)
    : fixtureResolutionDiagnosisProvider.getDiagnosis(caseId);
