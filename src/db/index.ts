import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

let pool: Pool | undefined;

export const getDatabase = (): Database | undefined => {
  if (
    !process.env.DATABASE_URL ||
    process.env.NIDHI_DISABLE_DATABASE === "true"
  )
    return undefined;
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool, { schema });
};

export const closeDatabase = async () => {
  if (pool) await pool.end();
  pool = undefined;
};

export function createDatabase(connectionString: string): Database {
  return drizzle(new Pool({ connectionString }), { schema });
}
