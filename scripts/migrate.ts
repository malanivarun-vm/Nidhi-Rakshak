import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

if (process.env.NODE_ENV === "production")
  throw new Error("Refusing development migration command in production.");
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:55422/postgres";
const migrationDirectory = join(process.cwd(), "drizzle");
const migrations = readdirSync(migrationDirectory)
  .filter((file) => /^\d{4}_.+\.sql$/.test(file))
  .sort();

if (migrations.length === 0)
  throw new Error("No SQL migrations found in drizzle/.");

const client = new pg.Client({ connectionString: databaseUrl });
const main = async () => {
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name varchar(120) PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const foundationExists = await client.query(
      "SELECT to_regclass('public.claims') IS NOT NULL AS exists",
    );
    if (foundationExists.rows[0]?.exists === true)
      await client.query(
        "INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [migrations[0]],
      );
    for (const migration of migrations) {
      const applied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [migration],
      );
      if (applied.rowCount !== 0) continue;
      const sql = readFileSync(join(migrationDirectory, migration), "utf8");
      if (
        foundationExists.rows[0]?.exists === true &&
        migration === migrations[1]
      ) {
        await client.query(
          "ALTER TABLE diagnosis_runs ADD COLUMN IF NOT EXISTS idempotency_key varchar(200)",
        );
        await client.query(
          "UPDATE diagnosis_runs SET idempotency_key = 'legacy:' || id::text WHERE idempotency_key IS NULL",
        );
        await client.query(
          "ALTER TABLE diagnosis_runs ALTER COLUMN idempotency_key SET NOT NULL",
        );
        await client.query(
          "CREATE UNIQUE INDEX IF NOT EXISTS diagnosis_runs_case_idempotency_key_idx ON diagnosis_runs (case_id, idempotency_key)",
        );
      } else if (
        foundationExists.rows[0]?.exists === true &&
        migration === migrations[2]
      ) {
        await client.query(
          "ALTER TABLE proposed_changes ADD COLUMN IF NOT EXISTS idempotency_key varchar(120)",
        );
        await client.query(
          "ALTER TABLE handoffs ADD COLUMN IF NOT EXISTS idempotency_key varchar(120)",
        );
        await client.query(
          "ALTER TABLE case_artifacts ADD COLUMN IF NOT EXISTS idempotency_key varchar(120)",
        );
        await client.query(
          "CREATE UNIQUE INDEX IF NOT EXISTS proposed_changes_idempotency_key_idx ON proposed_changes (idempotency_key)",
        );
        await client.query(
          "CREATE UNIQUE INDEX IF NOT EXISTS handoffs_idempotency_key_idx ON handoffs (idempotency_key)",
        );
        await client.query(
          "CREATE UNIQUE INDEX IF NOT EXISTS case_artifacts_idempotency_key_idx ON case_artifacts (idempotency_key)",
        );
      } else await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        migration,
      ]);
    }
    await client.query("COMMIT");
    process.stdout.write(
      `Applied ${migrations.length} migrations to ${databaseUrl.replace(/:.+@/, ":***@")}\n`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
};

void main();
