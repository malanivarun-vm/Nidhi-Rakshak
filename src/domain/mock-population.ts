import type { JourneyType, Verdict } from "./contracts";
import { GOLDEN_FIXTURES } from "./golden-fixtures";

export type SyntheticCase = {
  caseId: string;
  memberRef: string;
  pfAccountRef: string;
  rejectionCode: string;
  journeyType: JourneyType;
  verdict: Verdict;
  golden: boolean;
  syntheticMemberRef: string;
};

export const DEMO_MEMBER_REF = "demo-member-001";

const distribution: Array<[JourneyType, string, Verdict]> = [
  ["MISMATCH", "KYC_NAME_MISMATCH", "FIX"],
  ["MISSING_DATA", "EXIT_DATE_MISSING", "FORWARD"],
  ["VALIDATION_FAILURE", "BANK_DETAILS_INVALID", "FIX"],
  ["SERVICE_HISTORY", "SERVICE_OVERLAP", "FORWARD"],
  ["ELIGIBILITY", "CLAIM_EXCEEDS_CAP", "FIX"],
  ["RECORD_CONSOLIDATION", "MEMBER_IDS_UNMERGED", "FIX"],
  ["PENDING_PROCESS", "TRANSFER_IN_PENDING", "NONE"],
  ["UNSUPPORTED", "UNMAPPED_REJECTION", "NONE"],
];

export function generateSyntheticCases(
  count = 500,
  seed = 20260828,
): SyntheticCase[] {
  if (!Number.isInteger(count) || count < 4)
    throw new Error("count must be an integer >= 4");
  const cases = Object.values(GOLDEN_FIXTURES).map((fixture, index) => ({
    caseId: fixture.caseId,
    memberRef: DEMO_MEMBER_REF,
    pfAccountRef: `PF-DEMO-${String(index + 1).padStart(2, "0")}`,
    rejectionCode: fixture.rejectionCode,
    journeyType: fixture.journeyType,
    verdict: fixture.verdict ?? "NONE",
    golden: true,
    syntheticMemberRef: `SYNTH-MEMBER-${fixture.caseId}`,
  }));
  let index = 0;
  while (cases.length < count) {
    const [journeyType, rejectionCode, verdict] =
      distribution[index % distribution.length];
    const variant = (seed + index * 7919) % 100000;
    cases.push({
      caseId: `case-synthetic-${String(cases.length + 1).padStart(4, "0")}`,
      memberRef: `synthetic-member-${String(Math.floor(index / 4) + 1).padStart(3, "0")}`,
      pfAccountRef: `PF-SYNTH-${String(variant).padStart(5, "0")}`,
      rejectionCode,
      journeyType,
      verdict,
      golden: false,
      syntheticMemberRef: `SYNTH-${String(variant).padStart(5, "0")}`,
    });
    index += 1;
  }
  return cases;
}

export function summarizeSyntheticCases(cases: SyntheticCase[]) {
  return cases.reduce<{
    journey: Record<string, number>;
    verdict: Record<string, number>;
  }>(
    (summary, item) => {
      summary.journey[item.journeyType] =
        (summary.journey[item.journeyType] ?? 0) + 1;
      summary.verdict[item.verdict] = (summary.verdict[item.verdict] ?? 0) + 1;
      return summary;
    },
    { journey: {}, verdict: {} },
  );
}
