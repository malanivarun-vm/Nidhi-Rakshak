import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export function createDatabase(connectionString: string): Database {
  return drizzle(new Pool({ connectionString }), { schema });
}
