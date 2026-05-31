export type SourceDocument = {
  id: string;
  fileName: string;
  receivedAt: string;
  rawText: string;
};

export type ExtractedFields = {
  customer?: string;
  referenceNumber?: string;
  pickupDate?: string;
  deliveryAddress?: string;
  weightKg?: number | string;
};

export type DocumentStatus = "new" | "needs_review" | "ready" | "exported";

export type DocumentRecord = {
  source: SourceDocument;
  fields: ExtractedFields;
  approved: boolean;
  exported: boolean;
  reviewNote: string;
};

export type ValidationIssue = {
  field: keyof ExtractedFields;
  message: string;
  severity: "error" | "warning";
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type FieldName = keyof ExtractedFields;
