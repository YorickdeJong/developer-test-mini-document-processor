import { describe, expect, it } from "vitest";
import { evaluateOrder } from "../evaluateRules";
import type { Order, Rule } from "../types";

describe("evaluateOrder", () => {
  it("fails required rules when a field is blank", () => {
    const order: Order = { id: "order_test", reference: "" };
    const rules: Rule[] = [
      {
        id: "reference-required",
        type: "required",
        path: "reference",
        severity: "error",
        message: "Reference is required.",
      },
    ];

    const evaluation = evaluateOrder(order, rules);

    expect(evaluation.status).toBe("blocked");
    expect(evaluation.results[0]).toMatchObject({
      ruleId: "reference-required",
      status: "fail",
    });
  });

  it("passes min rules when a numeric value is high enough", () => {
    const order: Order = { id: "order_test", weightKg: 10 };
    const rules: Rule[] = [
      {
        id: "weight-positive",
        type: "min",
        path: "weightKg",
        value: 1,
        severity: "error",
        message: "Weight must be positive.",
      },
    ];

    expect(evaluateOrder(order, rules).status).toBe("valid");
  });
});

