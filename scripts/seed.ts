import { GOLDEN_FIXTURES } from "../src/domain/golden-fixtures";
import {
  generateSyntheticCases,
  summarizeSyntheticCases,
} from "../src/domain/mock-population";

const args = new Set(process.argv.slice(2));
const countArg = process.argv.find((value) => value.startsWith("--count="));
const count = Number(countArg?.split("=")[1] ?? "500");
const seedArg = process.argv.find((value) => value.startsWith("--seed="));
const seed = Number(seedArg?.split("=")[1] ?? "20260828");

if (
  process.env.NODE_ENV === "production" ||
  process.env.ALLOW_DEMO_SEED === "true"
) {
  throw new Error(
    "Refusing to seed production or explicitly unsafe environment.",
  );
}
if (!Number.isInteger(count) || count < 4)
  throw new Error("--count must be an integer >= 4");
if (!Number.isInteger(seed)) throw new Error("--seed must be an integer");

const golden = Object.values(GOLDEN_FIXTURES);
const cases = generateSyntheticCases(count, seed);
const summary = summarizeSyntheticCases(cases);

if (args.has("--verify")) {
  if (golden.length !== 4) throw new Error("Expected four golden fixtures");
  console.log(
    JSON.stringify(
      {
        ok: true,
        count,
        seed,
        goldenCases: golden.map((item) => item.caseId),
        familyCounts: summary.journey,
        verdictCounts: summary.verdict,
        generatedCases: cases.length,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
if (args.has("--reset"))
  console.log(
    "Reset requested: database adapter will be wired in the schema session.",
  );
console.log(
  JSON.stringify(
    {
      mode: "deterministic-fixture-plan",
      count,
      seed,
      goldenCases: golden.map((item) => item.caseId),
      familyCounts: summary.journey,
      verdictCounts: summary.verdict,
      generatedCases: cases.length,
      note: "Cases are generated deterministically in memory; database insertion is wired in the schema-backed implementation session.",
    },
    null,
    2,
  ),
);
