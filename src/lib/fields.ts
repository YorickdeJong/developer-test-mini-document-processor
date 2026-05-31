import type { FieldName } from "./types";

export const FIELD_ORDER: FieldName[] = [
  "customer",
  "referenceNumber",
  "pickupDate",
  "deliveryAddress",
  "weightKg",
];

export const FIELD_LABELS: Record<FieldName, string> = {
  customer: "Customer",
  referenceNumber: "Reference number",
  pickupDate: "Pickup date",
  deliveryAddress: "Delivery address",
  weightKg: "Weight kg",
};

