import { desc, eq, sql } from "drizzle-orm";
import { type Database, createDatabase } from "../../db";
import { diagnosisRuns } from "../../db/schema";
import { DiagnosisResult } from "../../domain/contracts";
import type { DiagnosisRepository } from "./diagnosis-provider";

export function createDrizzleDiagnosisRepository(
  database: Database,
): DiagnosisRepository {
  return {
    async getLatestByCaseId(caseId) {
      const [row] = await database
        .select({ result: diagnosisRuns.result })
        .from(diagnosisRuns)
        .where(sql`${diagnosisRuns.result}->>'caseId' = ${caseId}`)
        .orderBy(desc(diagnosisRuns.version))
        .limit(1);

      return row === undefined ? null : DiagnosisResult.parse(row.result);
    },
  };
}

export function createDatabaseDiagnosisRepository(connectionString: string) {
  return createDrizzleDiagnosisRepository(createDatabase(connectionString));
}
