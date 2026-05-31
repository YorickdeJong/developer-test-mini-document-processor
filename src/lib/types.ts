export type Severity = "error" | "warning";
export type RuleType =
  | "required"
  | "number"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
  | "oneOf"
  | "regex"
  | "date";

export type Order = {
  id: string;
  [key: string]: unknown;
};

export type Customer = {
  code: string;
  name: string;
  region: string;
};

export type RuleCondition = {
  path: string;
  equals?: unknown;
  notEquals?: unknown;
  oneOf?: unknown[];
};

type BaseRule = {
  id: string;
  path: string;
  severity: Severity;
  message: string;
  when?: RuleCondition;
};

export type RequiredRule = BaseRule & {
  type: "required";
};

export type NumberRule = BaseRule & {
  type: "number";
};

export type MinRule = BaseRule & {
  type: "min";
  value: number;
};

export type MaxRule = BaseRule & {
  type: "max";
  value: number;
};

export type OneOfRule = BaseRule & {
  type: "oneOf";
  values: unknown[];
};

export type LengthRule = BaseRule & {
  type: "minLength" | "maxLength";
  value: number;
};

export type RegexRule = BaseRule & {
  type: "regex";
  pattern: string;
};

export type DateRule = BaseRule & {
  type: "date";
  format?: "iso";
};

export type Rule =
  | RequiredRule
  | NumberRule
  | MinRule
  | MaxRule
  | LengthRule
  | OneOfRule
  | RegexRule
  | DateRule;

export type RuleResult = {
  ruleId: string;
  path: string;
  type: Rule["type"];
  severity: Severity;
  status: "pass" | "fail" | "skipped" | "unsupported";
  message: string;
  actual: unknown;
};

export type OrderStatus = "valid" | "warning" | "blocked";

export type OrderEvaluation = {
  orderId: string;
  status: OrderStatus;
  results: RuleResult[];
};
