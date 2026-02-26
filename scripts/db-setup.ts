/**
 * Database setup script for Scout.
 *
 * Applies the SQL schema in src/db/schema.sql to the Neon PostgreSQL database
 * specified by the DATABASE_URL environment variable.
 *
 * Usage:
 *   DATABASE_URL="<neon-connection-string>" npx tsx scripts/db-setup.ts
 *
 * Or, after setting DATABASE_URL in .env.local:
 *   npm run db:setup
 */

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is not set.");
  console.error(
    "Copy .env.example to .env.local and fill in your Neon connection string."
  );
  process.exit(1);
}

const schemaPath = join(process.cwd(), "src", "db", "schema.sql");
const schemaSql = readFileSync(schemaPath, "utf-8");

const sql = neon(databaseUrl);

async function setup() {
  console.log("Applying database schema...");
  // Split on semicolons to run each statement individually via the Neon
  // HTTP driver (which executes one statement per request).
  // NOTE: This assumes the schema contains no semicolons inside string
  // literals or comments (which is true for src/db/schema.sql).
  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      // Use ordinary function call syntax to execute a raw SQL string.
      await sql(statement);
    } catch (err) {
      console.error(`Failed to execute statement:\n${statement}\n`);
      throw err;
    }
  }

  console.log("Database schema applied successfully.");
}

setup().catch((err) => {
  console.error("Failed to apply database schema:", err);
  process.exit(1);
});
