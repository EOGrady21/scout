import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local (Next.js convention) before anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "Error: DATABASE_URL environment variable is not set.\n" +
      "Copy .env.example to .env.local and fill in your Neon connection string."
  );
  process.exit(1);
}

async function main() {
  const sql = neon(databaseUrl!);

  const schemaPath = path.resolve(process.cwd(), "src/db/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  console.log("Running database setup...");
  await sql(schema);
  console.log("Database setup complete.");
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(
    "Database setup failed:",
    message,
    "\nCommon causes: invalid DATABASE_URL, network/SSL issues, or SQL syntax errors."
  );
  process.exit(1);
});
