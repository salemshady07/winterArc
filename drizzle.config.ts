import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Loads .env so DATABASE_URL is available locally; in any other shell you can
// override it inline, e.g.:
//   DATABASE_URL="postgresql://prod-host/db" npx drizzle-kit push
config({ quiet: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // Prefer a direct connection for schema changes when an integration
    // exposes one; otherwise use the same pooled URL as the application.
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      process.env.POSTGRES_URL_NON_POOLING ??
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
