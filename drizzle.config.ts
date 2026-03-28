import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Next.js loads .env.local; Drizzle CLI does not — load the same files here.
config({ path: ".env" });
config({ path: ".env.local", override: true });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing. Add it to .env.local (or .env) before running drizzle-kit."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
