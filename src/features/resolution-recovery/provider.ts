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

export const getResolutionDiagnosis = (caseId: string) =>
  fixtureResolutionDiagnosisProvider.getDiagnosis(caseId);
