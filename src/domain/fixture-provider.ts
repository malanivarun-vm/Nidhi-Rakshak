import type { DiagnosisResult } from "./contracts";
import { GOLDEN_FIXTURES } from "./golden-fixtures";

export type DiagnosisFixtureId = keyof typeof GOLDEN_FIXTURES;

export function getDiagnosisFixture(id: DiagnosisFixtureId): DiagnosisResult {
  return GOLDEN_FIXTURES[id];
}
