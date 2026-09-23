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
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
