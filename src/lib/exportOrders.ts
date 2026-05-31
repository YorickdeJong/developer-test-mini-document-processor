import { evaluateOrder } from "./evaluateRules";
import type { Order, Rule } from "./types";

export function buildExportPayload(orders: Order[], rules: Rule[]) {
  return orders
    .filter((order) => evaluateOrder(order, rules).status === "valid")
    .map((order) => ({
      id: order.id,
      customerCode: order.customerCode ?? null,
      reference: order.reference ?? null,
      pickupDate: order.pickupDate ?? null,
      serviceLevel: order.serviceLevel ?? null,
      weightKg: order.weightKg ?? null,
      pallets: order.pallets ?? null,
      addresses: order.addresses ?? null,
    }));
}

