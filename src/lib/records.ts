import { extractDocumentFields } from "./extraction";
import type { DocumentRecord, SourceDocument } from "./types";

export function createInitialRecords(
  sourceDocuments: SourceDocument[],
): DocumentRecord[] {
  return sourceDocuments.map((source) => ({
    source,
    fields: extractDocumentFields(source),
    approved: false,
    exported: false,
    reviewNote: "",
  }));
}

