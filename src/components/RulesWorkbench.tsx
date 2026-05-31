"use client";

import { useMemo, useState, type ReactNode } from "react";
import seedCustomers from "@/data/customers.json";
import seedOrders from "@/data/orders.json";
import seedRules from "@/data/rules.json";
import { evaluateOrders } from "@/lib/evaluateRules";
import type { Customer, Order, OrderEvaluation, Rule, RuleType, Severity } from "@/lib/types";

const starterOrdersJson = JSON.stringify(seedOrders, null, 2);
const starterRulesJson = JSON.stringify(seedRules, null, 2);
const customers = seedCustomers as Customer[];

const ruleTypes: RuleType[] = [
  "required",
  "number",
  "min",
  "max",
  "minLength",
  "maxLength",
  "oneOf",
  "regex",
  "date",
];

const severities: Severity[] = ["error", "warning"];
type Tab = "rules" | "input" | "results";

export default function RulesWorkbench() {
  const [activeTab, setActiveTab] = useState<Tab>("rules");
  const [rulesJson, setRulesJson] = useState(starterRulesJson);
  const [ordersJson, setOrdersJson] = useState(starterOrdersJson);
  const [results, setResults] = useState<OrderEvaluation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    if (!results) {
      return { valid: 0, warning: 0, blocked: 0 };
    }

    return results.reduce(
      (summary, item) => {
        summary[item.status] += 1;
        return summary;
      },
      { valid: 0, warning: 0, blocked: 0 },
    );
  }, [results]);

  function runEvaluation() {
    try {
      const orders = parseJsonArray<Order>(ordersJson, "Input JSON");
      const rules = parseJsonArray<Rule>(rulesJson, "Rules JSON");

      setResults(evaluateOrders(orders, rules));
      setError(null);
      setActiveTab("results");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not evaluate JSON.");
      setResults(null);
    }
  }

  function resetStarterData() {
    setRulesJson(starterRulesJson);
    setOrdersJson(starterOrdersJson);
    setResults(null);
    setError(null);
  }

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Developer test starter</p>
        <h1>Rules Engine Workbench</h1>
        <p>
          Build a focused tool for configuring validation rules, testing extracted
          order JSON, and reviewing which orders are ready for export.
        </p>
      </header>

      <section className="toolbar" aria-label="Workbench controls">
        <nav className="tabs" aria-label="Workbench sections">
          <TabButton active={activeTab === "rules"} onClick={() => setActiveTab("rules")}>
            Configure Rules
          </TabButton>
          <TabButton active={activeTab === "input"} onClick={() => setActiveTab("input")}>
            Input JSON
          </TabButton>
          <TabButton active={activeTab === "results"} onClick={() => setActiveTab("results")}>
            Results
          </TabButton>
        </nav>
        <div className="button-row">
          <button className="secondary" onClick={resetStarterData} type="button">
            Reset
          </button>
          <button onClick={runEvaluation} type="button">
            Evaluate
          </button>
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="workspace">
        {activeTab === "rules" ? (
          <RulesTab
            rulesJson={rulesJson}
            setRulesJson={setRulesJson}
            ruleTypes={ruleTypes}
          />
        ) : null}

        {activeTab === "input" ? (
          <InputTab ordersJson={ordersJson} setOrdersJson={setOrdersJson} />
        ) : null}

        {activeTab === "results" ? (
          <ResultsTab counts={counts} results={results} />
        ) : null}
      </section>
    </main>
  );
}

function RulesTab({
  rulesJson,
  setRulesJson,
  ruleTypes,
}: {
  rulesJson: string;
  setRulesJson: (value: string) => void;
  ruleTypes: RuleType[];
}) {
  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Configure Rules</h2>
            <p>Edit the seed rules or replace them with your own rule set.</p>
          </div>
        </div>
        <textarea
          aria-label="Rules JSON"
          className="json-editor tall"
          onChange={(event) => setRulesJson(event.target.value)}
          spellCheck={false}
          value={rulesJson}
        />
      </section>

      <aside className="panel">
        <h2>Rule Builder Shell</h2>
        <div className="form-grid">
          <label>
            <span>Rule ID</span>
            <input placeholder="reference-required" />
          </label>
          <label>
            <span>Path</span>
            <input placeholder="addresses.delivery.postcode" />
          </label>
          <label>
            <span>Type</span>
            <select defaultValue="required">
              {ruleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Severity</span>
            <select defaultValue="error">
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Value</span>
            <input placeholder="25000, ^[A-Z0-9-]+$, chilled" />
          </label>
          <label>
            <span>Message</span>
            <input placeholder="Reference is required before export." />
          </label>
          <label>
            <span>When path</span>
            <input placeholder="serviceLevel" />
          </label>
          <label>
            <span>When equals</span>
            <input placeholder="temperature_controlled" />
          </label>
        </div>
        <button className="secondary full-width" disabled type="button">
          Add Rule
        </button>
        <div className="chip-list" aria-label="Rule types">
          {ruleTypes.map((type) => (
            <span className="chip" key={type}>
              {type}
            </span>
          ))}
        </div>
      </aside>
    </div>
  );
}

function InputTab({
  ordersJson,
  setOrdersJson,
}: {
  ordersJson: string;
  setOrdersJson: (value: string) => void;
}) {
  return (
    <div className="two-column input-layout">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Input JSON</h2>
            <p>Paste an array of extracted orders and evaluate it against the rules.</p>
          </div>
        </div>
        <textarea
          aria-label="Orders JSON"
          className="json-editor tall"
          onChange={(event) => setOrdersJson(event.target.value)}
          spellCheck={false}
          value={ordersJson}
        />
      </section>

      <aside className="panel">
        <h2>Customer Lookup</h2>
        <pre>{JSON.stringify(customers, null, 2)}</pre>
      </aside>
    </div>
  );
}

function ResultsTab({
  counts,
  results,
}: {
  counts: Record<"valid" | "warning" | "blocked", number>;
  results: OrderEvaluation[] | null;
}) {
  return (
    <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Output</h2>
          <p>Raw evaluator response.</p>
          </div>
        </div>

      <div className="summary-grid" aria-label="Result summary">
        <SummaryTile label="Valid" value={counts.valid} />
        <SummaryTile label="Warnings" value={counts.warning} />
        <SummaryTile label="Blocked" value={counts.blocked} />
      </div>

      {results ? (
        <textarea
          aria-label="Evaluation output"
          className="json-editor output"
          readOnly
          value={JSON.stringify(results, null, 2)}
        />
      ) : (
        <p className="empty">Run evaluation to see rule results.</p>
      )}
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="summary-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={active ? "tab active" : "tab"}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function parseJsonArray<T>(value: string, label: string): T[] {
  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON array.`);
  }

  return parsed as T[];
}
