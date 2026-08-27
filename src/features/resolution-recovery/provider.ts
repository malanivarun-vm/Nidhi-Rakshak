import type { DiagnosisResult } from "../../domain/contracts";
import { DiagnosisResult as DiagnosisResultSchema } from "../../domain/contracts";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";
import { createDiagnosisApiProvider } from "../claim-intelligence/diagnosis-api-provider";

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
      const provider = createDiagnosisApiProvider({
        NIDHI_FIXTURE_MODE: "false",
        DATABASE_URL: process.env.DATABASE_URL,
      });
      const result = provider ? await provider.getByCaseId(caseId) : null;
      return result === null ? undefined : DiagnosisResultSchema.parse(result);
    },
  };

export const getResolutionDiagnosis = (caseId: string) =>
  process.env.NIDHI_FIXTURE_MODE === "false"
    ? databaseResolutionDiagnosisProvider.getDiagnosis(caseId)
    : fixtureResolutionDiagnosisProvider.getDiagnosis(caseId);
