import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(url);
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");

  console.log("Running database migrations...");
  try {
    await sql(schema);
  } catch (err) {
    console.error("Migration failed while executing schema.sql:", err);
    throw err;
  }
  console.log("Migrations complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
