import { validateExtraction } from "./validation";
import type { DocumentRecord, DocumentStatus } from "./types";

export function getDocumentStatus(record: DocumentRecord): DocumentStatus {
  if (record.exported) {
    return "exported";
  }

  if (record.approved) {
    return "ready";
  }

  const validation = validateExtraction(record.fields);
  return validation.valid ? "new" : "needs_review";
}

