import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Neon currently provides DATABASE_URL. Older Vercel Postgres integrations
// may instead expose POSTGRES_URL (and both integrations can provide an
// unpooled variant). Prefer a pooled URL for serverless runtime traffic, but
// accept all common names so connecting through Vercel Storage works without
// code changes.
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING;

if (!databaseUrl) {
  throw new Error(
    "No database connection string found. Set DATABASE_URL (recommended) or POSTGRES_URL in Vercel.",
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);

let schemaReadyPromise: Promise<void> | undefined;

/**
 * Ensures a newly provisioned production database is ready before an API
 * route queries it. CREATE TABLE IF NOT EXISTS is idempotent, and the promise
 * is cached for the lifetime of a warm serverless function. Drizzle Kit
 * remains the source of truth for future schema changes.
 */
export function ensureDatabaseSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      const client = await pool.connect();

      try {
        await client.query("BEGIN");
        // Serializes schema setup across concurrently starting Vercel
        // functions. The lock is released automatically on commit/rollback.
        await client.query("SELECT pg_advisory_xact_lock($1)", [87129453]);
        await client.query(`
          CREATE TABLE IF NOT EXISTS people (
            id serial PRIMARY KEY,
            name text NOT NULL UNIQUE,
            reps_left integer NOT NULL DEFAULT 0,
            plus3 integer NOT NULL DEFAULT 0,
            minus3 integer NOT NULL DEFAULT 0,
            created_at timestamp with time zone NOT NULL DEFAULT now()
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS settings (
            key text PRIMARY KEY,
            value text NOT NULL
          )
        `);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    })().catch((error: unknown) => {
      // Permit a later invocation to retry after a transient DB failure.
      schemaReadyPromise = undefined;
      throw error;
    });
  }

  return schemaReadyPromise;
}
