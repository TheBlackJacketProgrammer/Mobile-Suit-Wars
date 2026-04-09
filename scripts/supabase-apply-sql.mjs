import "dotenv/config";
import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

async function main() {
  const file = process.argv[2];
  if (!file) {
    throw new Error("Usage: node scripts/supabase-apply-sql.mjs <path-to-sql-file>");
  }

  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL is not set");
  }

  const sql = fs.readFileSync(file, "utf8");
  const client = new Client({ connectionString });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

