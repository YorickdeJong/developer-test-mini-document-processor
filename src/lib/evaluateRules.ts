import type { Order, OrderEvaluation, OrderStatus, Rule, RuleResult } from "./types";

export function evaluateOrder(order: Order, rules: Rule[]): OrderEvaluation {
  const results = rules.map((rule) => evaluateRule(order, rule));

  return {
    orderId: order.id,
    status: getOrderStatus(results),
    results,
  };
}

export function evaluateOrders(orders: Order[], rules: Rule[]) {
  return orders.map((order) => evaluateOrder(order, rules));
}

export function getOrderStatus(results: RuleResult[]): OrderStatus {
  if (
    results.some(
      (result) =>
        result.severity === "error" &&
        (result.status === "fail" || result.status === "unsupported"),
    )
  ) {
    return "blocked";
  }

  if (
    results.some(
      (result) => result.status === "fail" || result.status === "unsupported",
    )
  ) {
    return "warning";
  }

  return "valid";
}

export function evaluateRule(order: Order, rule: Rule): RuleResult {
  if (rule.when && !conditionMatches(order, rule.when.path, rule.when.equals)) {
    return baseResult(rule, "skipped", getValue(order, rule.path));
  }

  const actual = getValue(order, rule.path);

  if (rule.type === "required") {
    return baseResult(rule, isBlank(actual) ? "fail" : "pass", actual);
  }

  if (rule.type === "min") {
    const numeric = Number(actual);
    return baseResult(
      rule,
      Number.isFinite(numeric) && numeric >= rule.value ? "pass" : "fail",
      actual,
    );
  }

  // Interview task: add support for max, oneOf, stronger date checks, and nested paths.
  return baseResult(rule, "unsupported", actual, `Rule type "${rule.type}" is not implemented yet.`);
}

export function getValue(order: Order, path: string): unknown {
  // Starter limitation: only top-level fields work. Nested paths such as
  // addresses.delivery.postcode are part of the assessment.
  if (path.includes(".")) {
    return undefined;
  }

  return order[path];
}

function conditionMatches(order: Order, path: string, expected: unknown) {
  return getValue(order, path) === expected;
}

function baseResult(
  rule: Rule,
  status: RuleResult["status"],
  actual: unknown,
  message = rule.message,
): RuleResult {
  return {
    ruleId: rule.id,
    path: rule.path,
    type: rule.type,
    severity: rule.severity,
    status,
    message,
    actual,
  };
}

function isBlank(value: unknown) {
  return value === undefined || value === null || String(value).trim() === "";
}

