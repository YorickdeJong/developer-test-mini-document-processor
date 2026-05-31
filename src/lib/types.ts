export type Severity = "error" | "warning";

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
  equals: unknown;
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

export type Rule = RequiredRule | MinRule | MaxRule | OneOfRule;

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

