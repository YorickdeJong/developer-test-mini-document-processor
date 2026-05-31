import fs from "node:fs/promises";
import path from "node:path";
import initSqlJs, {
  type Database,
  type SqlJsStatic,
  type SqlValue,
} from "sql.js";
import seedDocuments from "@/data/documents.json";
import { extractDocumentFields } from "@/lib/extraction";
import { validateExtraction } from "@/lib/validation";
import type { SourceDocument } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "dev.db");
const SQL_WASM_PATH = path.join(
  process.cwd(),
  "node_modules",
  "sql.js",
  "dist",
  "sql-wasm.wasm",
);

let sqlPromise: Promise<SqlJsStatic> | null = null;

export async function resetDatabase() {
  const SQL = await getSql();
  const db = new SQL.Database();

  createSchema(db);
  seedDatabase(db, seedDocuments as SourceDocument[]);
  await saveDatabase(db);
}

export async function readDatabase<T>(callback: (db: Database) => T): Promise<T> {
  await ensureDatabase();
  const db = await openDatabase();

  try {
    return callback(db);
  } finally {
    db.close();
  }
}

export async function writeDatabase<T>(callback: (db: Database) => T): Promise<T> {
  await ensureDatabase();
  const db = await openDatabase();

  try {
    const result = callback(db);
    await saveDatabase(db);
    return result;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function selectRows<T>(
  db: Database,
  sql: string,
  params: SqlValue[] = [],
): T[] {
  const statement = db.prepare(sql);
  statement.bind(params);
  const rows: T[] = [];

  while (statement.step()) {
    rows.push(statement.getAsObject() as T);
  }

  statement.free();
  return rows;
}

async function ensureDatabase() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await resetDatabase();
  }
}

async function getSql() {
  sqlPromise ??= initSqlJs({
    locateFile: () => SQL_WASM_PATH,
  });
  return sqlPromise;
}

async function openDatabase() {
  const SQL = await getSql();
  const data = await fs.readFile(DB_PATH);
  return new SQL.Database(data);
}

async function saveDatabase(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_PATH, Buffer.from(db.export()));
  db.close();
}

function createSchema(db: Database) {
  db.run(`
    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      raw_text TEXT NOT NULL,
      received_at TEXT NOT NULL
    );

    CREATE TABLE extractions (
      document_id TEXT PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
      customer TEXT,
      reference_number TEXT,
      pickup_date TEXT,
      delivery_address TEXT,
      weight_kg TEXT,
      confidence_json TEXT NOT NULL DEFAULT '{}',
      validation_json TEXT NOT NULL DEFAULT '[]',
      review_note TEXT NOT NULL DEFAULT '',
      approved_at TEXT,
      exported_at TEXT
    );

    CREATE TABLE review_events (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);
}

function seedDatabase(db: Database, documents: SourceDocument[]) {
  const insertDocument = db.prepare(`
    INSERT INTO documents (id, file_name, raw_text, received_at)
    VALUES (?, ?, ?, ?)
  `);
  const insertExtraction = db.prepare(`
    INSERT INTO extractions (
      document_id,
      customer,
      reference_number,
      pickup_date,
      delivery_address,
      weight_kg,
      validation_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertEvent = db.prepare(`
    INSERT INTO review_events (id, document_id, type, note, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  for (const document of documents) {
    const fields = extractDocumentFields(document);
    const validation = validateExtraction(fields);

    insertDocument.run([
      document.id,
      document.fileName,
      document.rawText,
      document.receivedAt,
    ]);
    insertExtraction.run([
      document.id,
      fields.customer ?? null,
      fields.referenceNumber ?? null,
      fields.pickupDate ?? null,
      fields.deliveryAddress ?? null,
      fields.weightKg === undefined ? null : String(fields.weightKg),
      JSON.stringify(validation.issues),
    ]);
    insertEvent.run([
      `${document.id}-seeded`,
      document.id,
      "seeded",
      "Document imported from seed data.",
      now,
    ]);
  }

  insertDocument.free();
  insertExtraction.free();
  insertEvent.free();
}
