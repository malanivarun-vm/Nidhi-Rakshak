import { desc, eq } from "drizzle-orm";
import { type Database, createDatabase } from "../../db";
import { claims, diagnosisRuns, rescueCases } from "../../db/schema";
import {
  DiagnosisResult,
  RescueCaseSummary,
  type RescueCaseSummary as RescueCaseSummaryType,
} from "../../domain/contracts";
import { GOLDEN_FIXTURES } from "../../domain/golden-fixtures";
import { DEMO_MEMBER_REF } from "../../domain/mock-population";

export interface CaseListProvider {
  list(): Promise<RescueCaseSummaryType[]>;
}

const titleFor = (journeyType: string) =>
  ({
    MISMATCH: "Name differs across records",
    MISSING_DATA: "Last working day is missing",
    VALIDATION_FAILURE: "Bank detail needs correction",
    UNSUPPORTED: "Rejection needs more evidence",
    SERVICE_HISTORY: "Employment dates overlap",
    ELIGIBILITY: "Claim amount is over the limit",
    RECORD_CONSOLIDATION: "Two PF records need linking",
    PENDING_PROCESS: "Transfer is already in progress",
  })[journeyType] ?? "Rejected PF claim";

const summaryFromDiagnosis = (
  diagnosis: unknown,
  claimType: string,
  submittedAt: Date,
  status: string,
): RescueCaseSummaryType => {
  const result = DiagnosisResult.parse(diagnosis);
  return RescueCaseSummary.parse({
    caseId: result.caseId,
    claimType,
    submittedAt: submittedAt.toISOString(),
    status,
    title: titleFor(result.journeyType),
    reason: result.problemSummary,
  });
};

export function createFixtureCaseListProvider(): CaseListProvider {
  return {
    async list() {
      return Object.values(GOLDEN_FIXTURES).map((fixture) =>
        summaryFromDiagnosis(
          fixture,
          "WITHDRAWAL",
          new Date("2026-08-27T00:00:00.000Z"),
          fixture.status === "UNSUPPORTED" ? "REFUSED" : "DIAGNOSED",
        ),
      );
    },
  };
}

export function createDatabaseCaseListProvider(
  database: Database,
  memberRef = DEMO_MEMBER_REF,
): CaseListProvider {
  return {
    async list() {
      const rows = await database
        .select({
          result: diagnosisRuns.result,
          claimType: claims.claimType,
          submittedAt: claims.submittedAt,
          status: rescueCases.status,
        })
        .from(diagnosisRuns)
        .innerJoin(rescueCases, eq(rescueCases.id, diagnosisRuns.caseId))
        .innerJoin(claims, eq(claims.id, rescueCases.claimId))
        .where(eq(claims.memberRef, memberRef))
        .orderBy(desc(claims.submittedAt));

      return rows.map((row) =>
        summaryFromDiagnosis(
          row.result,
          row.claimType,
          row.submittedAt,
          row.status,
        ),
      );
    },
  };
}

export function createDatabaseCaseListProviderFromUrl(
  connectionString: string,
): CaseListProvider {
  return createDatabaseCaseListProvider(createDatabase(connectionString));
}
