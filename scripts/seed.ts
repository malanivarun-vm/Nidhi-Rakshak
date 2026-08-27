import pg from "pg";
import { GOLDEN_FIXTURES } from "../src/domain/golden-fixtures";
import {
  generateSyntheticCases,
  summarizeSyntheticCases,
} from "../src/domain/mock-population";

const { Client } = pg;
const args = new Set(process.argv.slice(2));
const count = Number(
  process.argv.find((value) => value.startsWith("--count="))?.split("=")[1] ??
    "500",
);
const seed = Number(
  process.argv.find((value) => value.startsWith("--seed="))?.split("=")[1] ??
    "20260828",
);
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:55422/postgres";

if (
  process.env.NODE_ENV === "production" &&
  process.env.ALLOW_DEMO_SEED !== "true"
)
  throw new Error("Refusing to seed production without ALLOW_DEMO_SEED=true.");
if (!Number.isInteger(count) || count < 4)
  throw new Error("--count must be an integer >= 4");
if (!Number.isInteger(seed)) throw new Error("--seed must be an integer");

const cases = generateSyntheticCases(count, seed);
const summary = summarizeSyntheticCases(cases);
const golden = Object.values(GOLDEN_FIXTURES);

async function seedDatabase() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query("BEGIN");
    if (args.has("--reset"))
      await client.query(
        "TRUNCATE case_status_events, case_artifacts, handoffs, resolution_actions, simulations, proposed_changes, blockers, diagnosis_runs, timeline_events, evidence_items, record_snapshots, rescue_cases, claim_rejections, claims, rejection_contracts CASCADE",
      );
    for (const item of cases) {
      const claim = await client.query(
        "INSERT INTO claims (member_ref, pf_account_ref, external_ref, claim_type, submitted_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [
          item.memberRef,
          item.pfAccountRef,
          `${item.caseId}-claim`,
          "WITHDRAWAL",
          "2026-08-27T00:00:00Z",
        ],
      );
      const rejection = await client.query(
        "INSERT INTO claim_rejections (claim_id, raw_text, code) VALUES ($1, $2, $3) RETURNING id",
        [
          claim.rows[0].id,
          `Synthetic rejection for ${item.rejectionCode}`,
          item.rejectionCode,
        ],
      );
      const rescueCase = await client.query(
        "INSERT INTO rescue_cases (claim_id, rejection_id, status) VALUES ($1, $2, $3) RETURNING id",
        [
          claim.rows[0].id,
          rejection.rows[0].id,
          item.verdict === "NONE" ? "REFUSED" : "DIAGNOSED",
        ],
      );
      const fixture = Object.values(GOLDEN_FIXTURES).find(
        (candidate) => candidate.caseId === item.caseId,
      );
      const result = fixture ?? {
        contractVersion: "1",
        caseId: item.caseId,
        diagnosisId: `${item.caseId}-diagnosis`,
        rejectionCode: item.rejectionCode,
        journeyType: item.journeyType,
        status: item.verdict === "NONE" ? "UNSUPPORTED" : "DIAGNOSED",
        supportStatus: "SUPPORTED",
        problemSummary: `Synthetic ${item.journeyType.toLowerCase()} case.`,
        owner:
          item.verdict === "FIX"
            ? "MEMBER"
            : item.verdict === "FORWARD"
              ? "EMPLOYER"
              : item.verdict === "FIGHT"
                ? "EPFO"
                : "NONE",
        doNotTouch: { applies: false },
        evidenceState: "SUFFICIENT",
        evidence: [],
        nextRouteType:
          item.verdict === "FIX"
            ? "MEMBER_CORRECTION"
            : item.verdict === "FORWARD"
              ? "EMPLOYER"
              : item.verdict === "FIGHT"
                ? "EPFO"
                : "NONE",
        recommendedAction: "Synthetic fixture action.",
        version: 1,
      };
      const diagnosis = await client.query(
        "INSERT INTO diagnosis_runs (case_id, idempotency_key, version, status, result) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [
          rescueCase.rows[0].id,
          `${item.caseId}:diagnosis:v1`,
          1,
          result.status,
          result,
        ],
      );
      await client.query(
        "INSERT INTO evidence_items (case_id, source, label, state, provenance) VALUES ($1, $2, $3, $4, $5)",
        [
          rescueCase.rows[0].id,
          "synthetic-fixture",
          item.golden ? "Golden case evidence" : "Synthetic case evidence",
          "VERIFIED",
          { synthetic: true, seed },
        ],
      );
      if (fixture?.firstDivergence)
        await client.query(
          "INSERT INTO timeline_events (case_id, occurred_on, label, source, payload) VALUES ($1, $2, $3, $4, $5)",
          [
            rescueCase.rows[0].id,
            "2019-01-01",
            fixture.firstDivergence.label,
            fixture.firstDivergence.source,
            fixture.firstDivergence,
          ],
        );
      if (fixture?.blocker)
        await client.query(
          "INSERT INTO blockers (diagnosis_id, type, field, reason, owner) VALUES ($1, $2, $3, $4, $5)",
          [
            diagnosis.rows[0].id,
            fixture.blocker.type,
            fixture.blocker.field ?? null,
            fixture.blocker.reason,
            fixture.owner,
          ],
        );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

async function verifyDatabase() {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const result = await client.query(
    "SELECT COUNT(*)::int AS count FROM rescue_cases",
  );
  await client.end();
  if (result.rows[0].count !== count)
    throw new Error(
      `Expected ${count} rescue cases, found ${result.rows[0].count}`,
    );
}

async function main() {
  if (args.has("--verify")) {
    if (!args.has("--fixtures-only")) await verifyDatabase();
    console.log(
      JSON.stringify(
        {
          ok: true,
          databaseUrl: databaseUrl.replace(/:.+@/, ":***@"),
          count,
          seed,
          goldenCases: golden.map((item) => item.caseId),
          familyCounts: summary.journey,
          verdictCounts: summary.verdict,
          generatedCases: cases.length,
          verification: args.has("--fixtures-only")
            ? "fixtures-only"
            : "database",
        },
        null,
        2,
      ),
    );
  } else {
    await seedDatabase();
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: args.has("--reset") ? "reset-and-seed" : "seed",
          count,
          seed,
          familyCounts: summary.journey,
          verdictCounts: summary.verdict,
          generatedCases: cases.length,
        },
        null,
        2,
      ),
    );
  }
}

void main();
