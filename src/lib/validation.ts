import type { ExtractedFields, ValidationIssue, ValidationResult } from "./types";

export function validateExtraction(fields: ExtractedFields): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!fields.customer?.trim()) {
    issues.push({
      field: "customer",
      message: "Customer is required.",
      severity: "error",
    });
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}

