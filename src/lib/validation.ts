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

  if (!fields.pickupDate?.trim()) {
    issues.push({
      field: "pickupDate",
      message: "Pickup date is required.",
      severity: "error",
    });
  } else if (Number.isNaN(Date.parse(fields.pickupDate))) {
    issues.push({
      field: "pickupDate",
      message: "Pickup date must be parseable.",
      severity: "error",
    });
  }

  if (fields.weightKg === undefined || String(fields.weightKg).trim() === "") {
    issues.push({
      field: "weightKg",
      message: "Weight is required.",
      severity: "error",
    });
  } else if (!Number.isFinite(Number(fields.weightKg))) {
    issues.push({
      field: "weightKg",
      message: "Weight must be numeric.",
      severity: "error",
    });
  }

  if (!fields.referenceNumber?.trim()) {
    issues.push({
      field: "referenceNumber",
      message: "Reference number is missing.",
      severity: "warning",
    });
  }

  if (!fields.deliveryAddress?.trim()) {
    issues.push({
      field: "deliveryAddress",
      message: "Delivery address is missing.",
      severity: "warning",
    });
  }

  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}
