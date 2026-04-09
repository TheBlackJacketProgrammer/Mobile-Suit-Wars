import fs from "node:fs";
import path from "node:path";

function escapeSqlString(value) {
  // Standard SQL string literal escaping: single quote doubled.
  return value.replace(/'/g, "''");
}

function toSqlLiteral(raw) {
  // pg_dump COPY text format default NULL marker is \N
  if (raw === "\\N") return "NULL";
  // Treat empty fields as NULL (matches typical app expectations better than '')
  if (raw === "") return "NULL";

  // Numbers: keep unquoted if it's a plain integer (works for smallint/int)
  if (/^-?\d+$/.test(raw)) return raw;

  return `'${escapeSqlString(raw)}'`;
}

function stripOwnerAndExtension(lines) {
  const out = [];
  for (const line of lines) {
    // Supabase doesn't allow setting table owners in SQL editor.
    if (/^ALTER TABLE .* OWNER TO /i.test(line)) continue;
    // Extensions are usually already enabled; creating them may be restricted.
    if (/^CREATE EXTENSION /i.test(line)) continue;
    if (/^COMMENT ON EXTENSION /i.test(line)) continue;
    out.push(line);
  }
  return out;
}

function convertCopyBlocks(lines, { chunkSize = 500 } = {}) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const copyMatch = line.match(
      /^COPY\s+([^\s]+)\s+\((.+)\)\s+FROM\s+stdin;$/i,
    );

    if (!copyMatch) {
      out.push(line);
      i += 1;
      continue;
    }

    const table = copyMatch[1]; // e.g. public._event_logs
    const columns = copyMatch[2]; // includes quoted identifiers if any
    i += 1;

    const rows = [];
    while (i < lines.length && lines[i] !== "\\.") {
      rows.push(lines[i]);
      i += 1;
    }
    // Skip the "\." line
    if (i < lines.length && lines[i] === "\\.") i += 1;

    // Emit inserts
    out.push(`-- Converted from COPY for ${table}`);
    out.push("BEGIN;");

    let buffer = [];
    let rowCount = 0;

    const flush = () => {
      if (buffer.length === 0) return;
      out.push(`INSERT INTO ${table} (${columns}) VALUES`);
      out.push(buffer.join(",\n") + ";");
      buffer = [];
    };

    for (const row of rows) {
      // COPY uses tab delimiters for text format here
      const parts = row.split("\t");
      const literals = parts.map(toSqlLiteral);
      buffer.push(`(${literals.join(", ")})`);
      rowCount += 1;
      if (buffer.length >= chunkSize) flush();
    }

    flush();
    out.push("COMMIT;");
    out.push(`-- ${rowCount} row(s) inserted into ${table}`);
    out.push("");
  }

  return out;
}

function main() {
  const input = process.argv[2];
  const output = process.argv[3];

  if (!input || !output) {
    console.error(
      "Usage: node scripts/convert-pgdump-copy-to-inserts.mjs <input.sql> <output.sql>",
    );
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), input);
  const outputPath = path.resolve(process.cwd(), output);

  const raw = fs.readFileSync(inputPath, "utf8");
  const lines = raw.split(/\r?\n/);

  const stripped = stripOwnerAndExtension(lines);
  const converted = convertCopyBlocks(stripped, { chunkSize: 500 });

  const header = [
    "-- Supabase SQL Editor compatible seed file",
    `-- Generated from: ${inputPath}`,
    "-- NOTE: pg_dump COPY ... FROM stdin blocks were converted to INSERTs.",
    "",
  ];

  fs.writeFileSync(outputPath, header.concat(converted).join("\n"), "utf8");
  console.log(`Wrote ${outputPath}`);
}

main();

