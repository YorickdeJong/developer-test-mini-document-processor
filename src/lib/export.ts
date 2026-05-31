import type { ExtractedFields, SourceDocument } from "./types";

export function buildExportPayload(
  document: SourceDocument,
  fields: ExtractedFields,
) {
  return {
    sourceDocumentId: document.id,
    exportedAt: new Date().toISOString(),
    data: {
      customer: clean(fields.customer),
      referenceNumber: clean(fields.referenceNumber),
      pickupDate: clean(fields.pickupDate),
      deliveryAddress: clean(fields.deliveryAddress),
      weightKg:
        fields.weightKg === undefined || String(fields.weightKg).trim() === ""
          ? null
          : Number(fields.weightKg),
    },
  };
}

function clean(value: string | undefined) {
  return value?.trim() || null;
}

