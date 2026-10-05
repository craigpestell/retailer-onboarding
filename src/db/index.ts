import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let instance: ReturnType<typeof create> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // prepare: false keeps this compatible with pooled (pgbouncer) connections.
  return drizzle(postgres(url, { prepare: false, max: 5 }), { schema });
}

export function getDb() {
  return (instance ??= create());
}
