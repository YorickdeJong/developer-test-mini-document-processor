import { buildExportPayload } from "@/lib/export";
import { validateExtraction } from "@/lib/validation";
import type { DocumentRecord, ExtractedFields } from "@/lib/types";
import type { Database } from "sql.js";
import { readDatabase, selectRows, writeDatabase } from "./db";

type DocumentRow = {
  id: string;
  file_name: string;
  raw_text: string;
  received_at: string;
  customer: string | null;
  reference_number: string | null;
  pickup_date: string | null;
  delivery_address: string | null;
  weight_kg: string | null;
  review_note: string;
  approved_at: string | null;
  exported_at: string | null;
};

export async function listDocumentRecords() {
  return readDatabase((db) =>
    selectRows<DocumentRow>(
      db,
      `
        SELECT
          d.id,
          d.file_name,
          d.raw_text,
          d.received_at,
          e.customer,
          e.reference_number,
          e.pickup_date,
          e.delivery_address,
          e.weight_kg,
          e.review_note,
          e.approved_at,
          e.exported_at
        FROM documents d
        JOIN extractions e ON e.document_id = d.id
        ORDER BY d.received_at ASC
      `,
    ).map(rowToRecord),
  );
}

export async function getDocumentRecord(id: string) {
  return readDatabase((db) => {
    const rows = selectRows<DocumentRow>(
      db,
      `
        SELECT
          d.id,
          d.file_name,
          d.raw_text,
          d.received_at,
          e.customer,
          e.reference_number,
          e.pickup_date,
          e.delivery_address,
          e.weight_kg,
          e.review_note,
          e.approved_at,
          e.exported_at
        FROM documents d
        JOIN extractions e ON e.document_id = d.id
        WHERE d.id = ?
      `,
      [id],
    );
    return rows[0] ? rowToRecord(rows[0]) : null;
  });
}

export async function updateDocumentReview(
  id: string,
  input: { fields?: ExtractedFields; reviewNote?: string },
) {
  return writeDatabase((db) => {
    const current = selectRows<DocumentRow>(
      db,
      `
        SELECT
          d.id,
          d.file_name,
          d.raw_text,
          d.received_at,
          e.customer,
          e.reference_number,
          e.pickup_date,
          e.delivery_address,
          e.weight_kg,
          e.review_note,
          e.approved_at,
          e.exported_at
        FROM documents d
        JOIN extractions e ON e.document_id = d.id
        WHERE d.id = ?
      `,
      [id],
    )[0];

    if (!current) {
      return null;
    }

    const fields = { ...rowToRecord(current).fields, ...input.fields };
    const validation = validateExtraction(fields);

    db.run(
      `
        UPDATE extractions
        SET
          customer = ?,
          reference_number = ?,
          pickup_date = ?,
          delivery_address = ?,
          weight_kg = ?,
          validation_json = ?,
          review_note = ?,
          approved_at = NULL,
          exported_at = NULL
        WHERE document_id = ?
      `,
      [
        fields.customer ?? null,
        fields.referenceNumber ?? null,
        fields.pickupDate ?? null,
        fields.deliveryAddress ?? null,
        fields.weightKg === undefined ? null : String(fields.weightKg),
        JSON.stringify(validation.issues),
        input.reviewNote ?? current.review_note,
        id,
      ],
    );
    addEvent(db, id, "updated", "Review fields updated.");
    return selectRecordById(db, id);
  });
}

export async function approveDocument(id: string) {
  return writeDatabase((db) => {
    const record = selectRecordById(db, id);
    if (!record) {
      return { record: null, error: "Document not found." };
    }

    const validation = validateExtraction(record.fields);
    if (!validation.valid) {
      return { record, error: "Document has validation errors.", validation };
    }

    db.run(
      "UPDATE extractions SET approved_at = ?, exported_at = NULL WHERE document_id = ?",
      [new Date().toISOString(), id],
    );
    addEvent(db, id, "approved", "Document approved for export.");
    return { record: selectRecordById(db, id), error: null };
  });
}

export async function exportDocument(id: string) {
  return writeDatabase((db) => {
    const record = selectRecordById(db, id);
    if (!record) {
      return { record: null, payload: null, error: "Document not found." };
    }

    if (!record.approved) {
      return { record, payload: null, error: "Document must be approved first." };
    }

    const payload = buildExportPayload(record.source, record.fields);
    db.run("UPDATE extractions SET exported_at = ? WHERE document_id = ?", [
      new Date().toISOString(),
      id,
    ]);
    addEvent(db, id, "exported", "Export payload generated.");

    return { record: selectRecordById(db, id), payload, error: null };
  });
}

function selectRecordById(db: Database, id: string) {
  const rows = selectRows<DocumentRow>(
    db,
    `
      SELECT
        d.id,
        d.file_name,
        d.raw_text,
        d.received_at,
        e.customer,
        e.reference_number,
        e.pickup_date,
        e.delivery_address,
        e.weight_kg,
        e.review_note,
        e.approved_at,
        e.exported_at
      FROM documents d
      JOIN extractions e ON e.document_id = d.id
      WHERE d.id = ?
    `,
    [id],
  );
  return rows[0] ? rowToRecord(rows[0]) : null;
}

function rowToRecord(row: DocumentRow): DocumentRecord {
  return {
    source: {
      id: row.id,
      fileName: row.file_name,
      rawText: row.raw_text,
      receivedAt: row.received_at,
    },
    fields: {
      customer: row.customer ?? undefined,
      referenceNumber: row.reference_number ?? undefined,
      pickupDate: row.pickup_date ?? undefined,
      deliveryAddress: row.delivery_address ?? undefined,
      weightKg: row.weight_kg ?? undefined,
    },
    approved: Boolean(row.approved_at),
    exported: Boolean(row.exported_at),
    reviewNote: row.review_note,
  };
}

function addEvent(
  db: Database,
  documentId: string,
  type: string,
  note: string,
) {
  db.run(
    `
      INSERT INTO review_events (id, document_id, type, note, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    [
      `${documentId}-${type}-${Date.now()}`,
      documentId,
      type,
      note,
      new Date().toISOString(),
    ],
  );
}
