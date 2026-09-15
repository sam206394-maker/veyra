/**
 * Applies Prisma migration SQL files directly to a PostgreSQL database.
 * Useful when the Prisma CLI cannot route to the database host
 * (e.g. Supabase direct connections that are IPv6-only).
 *
 * Usage: node scripts/apply-supabase-migration.mjs [migration-dir]
 * Reads DATABASE_URL from the environment (.env is auto-loaded).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import pg from "pg";
import "dotenv/config";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const migrationsDir = process.argv[2]
  ? join(process.cwd(), process.argv[2])
  : join(root, "prisma", "migrations");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (check .env)");
  process.exit(1);
}

// Build the client config manually. Percent-decoding a URI component fails on
// malformed escapes (e.g. "%cj"), and pg-connection-string may leave escapes
// undecoded — so decode only valid %XX sequences and keep the rest as-is.
function decodeLenient(value) {
  return value.replace(/%[0-9a-fA-F]{2}/g, (m) => String.fromCharCode(parseInt(m.slice(1), 16)));
}
const parsed = new URL(url);
const client = new pg.Client({
  host: parsed.hostname,
  port: Number(parsed.port || 5432),
  user: decodeLenient(parsed.username),
  password: decodeLenient(parsed.password),
  database: parsed.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("Connected to database.");

  // Create _prisma_migrations table if missing (same shape Prisma expects)
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" SERIAL PRIMARY KEY,
      "checksum" VARCHAR(64) NOT NULL,
      "finished_at" TIMESTAMPTZ,
      "migration_name" VARCHAR(255) NOT NULL,
      "logs" TEXT,
      "rolled_back_at" TIMESTAMPTZ,
      "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    )
  `);

  const applied = await client.query(`SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`);
  const appliedSet = new Set(applied.rows.map((r) => r.migration_name));

  const dirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  let appliedCount = 0;
  for (const dir of dirs) {
    if (appliedSet.has(dir)) {
      console.log(`Skipping (already applied): ${dir}`);
      continue;
    }
    const sqlPath = join(migrationsDir, dir, "migration.sql");
    const sql = readFileSync(sqlPath, "utf8");
    console.log(`Applying: ${dir}`);
    await client.query("BEGIN");
    try {
      await client.query(sql);
      const checksum = createHash("sha256").update(sql).digest("hex");
      await client.query(
        `INSERT INTO "_prisma_migrations" (checksum, finished_at, migration_name, started_at, applied_steps_count)
         VALUES ($1, now(), $2, now(), 1)`,
        [checksum, dir]
      );
      await client.query("COMMIT");
      appliedCount++;
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`Migration failed: ${dir} — ${err.message}`);
    }
  }

  const tables = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );
  console.log(`Done. Applied ${appliedCount} migration(s). Tables in public schema:`);
  console.log(tables.rows.map((r) => ` - ${r.tablename}`).join("\n"));
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => {}));
