import {
  DiagnosisResult,
  type DiagnosisResult as DiagnosisResultType,
} from "../../domain/contracts";
import {
  type DiagnosisFixtureId,
  getDiagnosisFixture,
} from "../../domain/fixture-provider";

const fixtureIds: readonly DiagnosisFixtureId[] = [
  "GOLDEN_FIGHT_RELATION_NAME",
  "GOLDEN_FORWARD_EXIT_DATE",
  "GOLDEN_FIX_BANK",
  "GOLDEN_UNSUPPORTED",
];

export interface DiagnosisProvider {
  getByCaseId(caseId: string): Promise<DiagnosisResultType | null>;
}

export interface DiagnosisRepository {
  getLatestByCaseId(caseId: string): Promise<DiagnosisResultType | null>;
}

export function createFixtureDiagnosisProvider(): DiagnosisProvider {
  const diagnosesByCaseId = new Map(
    fixtureIds.map((fixtureId) => {
      const diagnosis = DiagnosisResult.parse(getDiagnosisFixture(fixtureId));
      return [diagnosis.caseId, diagnosis] as const;
    }),
  );

  return {
    async getByCaseId(caseId) {
      return diagnosesByCaseId.get(caseId) ?? null;
    },
  };
}
