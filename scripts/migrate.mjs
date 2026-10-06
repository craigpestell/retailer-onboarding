// Applies pending migrations in ./drizzle. Used instead of `drizzle-kit migrate`,
// which exits 0 without printing anything when a migration fails.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(url, { max: 1, onnotice: () => {} });
try {
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  const rows = await client`select count(*)::int as n from drizzle.__drizzle_migrations`;
  console.log(`Migrations applied (${rows[0].n} recorded).`);
} catch (error) {
  console.error("Migration failed:", error.cause?.message ?? error.message);
  if (error.query) console.error(error.query);
  process.exitCode = 1;
} finally {
  await client.end();
}
