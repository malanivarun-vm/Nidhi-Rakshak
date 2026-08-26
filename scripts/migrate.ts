import { readFileSync } from "node:fs";

if (process.env.NODE_ENV === "production")
  throw new Error("Refusing development migration command in production.");
const migration = readFileSync("drizzle/0000_handy_karnak.sql", "utf8");
if (!migration.includes("CREATE TABLE"))
  throw new Error("Generated migration is missing table creation statements.");
console.log(
  "Migration verified locally. Connect the Drizzle adapter before applying SQL to Postgres.",
);
