import type { ExtractedFields, SourceDocument } from "./types";

export function buildExportPayload(
  document: SourceDocument,
  fields: ExtractedFields,
) {
  return {
    sourceDocumentId: document.id,
    exportedAt: new Date().toISOString(),
    data: fields,
  };
}

