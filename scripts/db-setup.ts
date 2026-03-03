import * as fs from "fs";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex <= 0) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// Load .env.local (Next.js convention) before anything else
loadEnvLocal();

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
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  console.log("Running database setup...");
  for (const statement of statements) {
    await sql(statement);
  }
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
