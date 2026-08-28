import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

const pools = new Map<string, Pool>();
const databases = new Map<string, Database>();

export const getDatabase = (): Database | undefined => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || process.env.NIDHI_DISABLE_DATABASE === "true")
    return undefined;
  return createDatabase(connectionString);
};

export const closeDatabase = async () => {
  await Promise.all([...pools.values()].map((pool) => pool.end()));
  pools.clear();
  databases.clear();
};

export function createDatabase(connectionString: string): Database {
  const existing = databases.get(connectionString);
  if (existing) return existing;

  const pool = new Pool({ connectionString });
  const database = drizzle(pool, { schema });
  pools.set(connectionString, pool);
  databases.set(connectionString, database);
  return database;
}
