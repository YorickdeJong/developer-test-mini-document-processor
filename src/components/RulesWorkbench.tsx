"use client";

import { useMemo, useState } from "react";
import seedCustomers from "@/data/customers.json";
import seedOrders from "@/data/orders.json";
import seedRules from "@/data/rules.json";
import { buildExportPayload } from "@/lib/exportOrders";
import { evaluateOrder } from "@/lib/evaluateRules";
import type { Customer, Order, OrderEvaluation, OrderStatus, Rule } from "@/lib/types";

const initialOrders = seedOrders as Order[];
const rules = seedRules as Rule[];
const customers = seedCustomers as Customer[];

export default function RulesWorkbench() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedId, setSelectedId] = useState(initialOrders[0]?.id);
  const [draftJson, setDraftJson] = useState(
    JSON.stringify(initialOrders[0] ?? {}, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const evaluations = useMemo(
    () => orders.map((order) => evaluateOrder(order, rules)),
    [orders],
  );
  const selected = orders.find((order) => order.id === selectedId);
  const selectedEvaluation = selected
    ? evaluateOrder(selected, rules)
    : undefined;
  const exportPayload = useMemo(() => buildExportPayload(orders, rules), [orders]);
  const counts = countStatuses(evaluations);

  function selectOrder(order: Order) {
    setSelectedId(order.id);
    setDraftJson(JSON.stringify(order, null, 2));
    setJsonError(null);
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(draftJson) as Order;
      if (!parsed.id || typeof parsed.id !== "string") {
        throw new Error("Order JSON must include a string id.");
      }

      setOrders((current) =>
        current.map((order) => (order.id === selectedId ? parsed : order)),
      );
      setSelectedId(parsed.id);
      setJsonError(null);
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON.");
    }
  }

  function resetOrders() {
    setOrders(initialOrders);
    selectOrder(initialOrders[0]);
  }

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Developer test starter</p>
        <h1>Rules Engine Workbench</h1>
        <p>
          Validate extracted logistics orders before export. The app has local
          JSON inputs, a partial TypeScript evaluator, and a starter UI. Improve
          the rules engine and operator workflow until the export decision is
          trustworthy.
        </p>
      </header>

      <section className="summary-grid" aria-label="Order status summary">
        <SummaryTile label="Valid" value={counts.valid} />
        <SummaryTile label="Warnings" value={counts.warning} />
        <SummaryTile label="Blocked" value={counts.blocked} />
        <SummaryTile label="Exportable" value={exportPayload.length} />
      </section>

      <section className="workspace">
        <aside className="inbox" aria-label="Orders">
          <div className="panel-heading">
            <h2>Orders</h2>
            <button onClick={resetOrders} type="button">
              Reset
            </button>
          </div>
          <div className="document-list">
            {orders.map((order) => {
              const evaluation = evaluations.find((item) => item.orderId === order.id);
              return (
                <button
                  className={order.id === selectedId ? "document active" : "document"}
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  type="button"
                >
                  <span>{order.id}</span>
                  <small>
                    {String(order.customerCode ?? "unknown")} ·{" "}
                    {String(order.reference ?? "no reference")}
                  </small>
                  <StatusBadge status={evaluation?.status ?? "blocked"} />
                </button>
              );
            })}
          </div>
        </aside>

        <section className="document-view" aria-label="Selected order">
          {selected && selectedEvaluation ? (
            <>
              <div className="panel-heading document-heading">
                <div>
                  <h2>{selected.id}</h2>
                  <span>{customerName(selected.customerCode)}</span>
                </div>
                <StatusBadge status={selectedEvaluation.status} />
              </div>

              <div className="document-grid">
                <article className="source-panel">
                  <div className="section-heading">
                    <h3>Order JSON</h3>
                    <button onClick={applyJson} type="button">
                      Apply JSON
                    </button>
                  </div>
                  <textarea
                    className="json-editor"
                    onChange={(event) => setDraftJson(event.target.value)}
                    spellCheck={false}
                    value={draftJson}
                  />
                  {jsonError ? <p className="error-banner">{jsonError}</p> : null}
                </article>

                <IssuesPanel evaluation={selectedEvaluation} />

                <article>
                  <h3>Rule results</h3>
                  <RuleResultsTable evaluation={selectedEvaluation} />
                </article>

                <article className="export-panel">
                  <h3>Export preview</h3>
                  {exportPayload.length ? (
                    <pre>{JSON.stringify(exportPayload, null, 2)}</pre>
                  ) : (
                    <p className="empty">No orders are currently valid for export.</p>
                  )}
                </article>
              </div>
            </>
          ) : (
            <p className="empty">No order selected.</p>
          )}
        </section>
      </section>

      <section className="notes-grid">
        <article>
          <h3>Known starter gaps</h3>
          <ul className="plain-list">
            <li>`max` and `oneOf` rules are not implemented yet.</li>
            <li>Nested paths like `addresses.delivery.postcode` do not work yet.</li>
            <li>Conditional rule explanations are minimal.</li>
            <li>Edits live in memory unless the optional backend stretch is wired.</li>
          </ul>
        </article>
        <article>
          <h3>Customer lookup</h3>
          <pre>{JSON.stringify(customers, null, 2)}</pre>
        </article>
      </section>
    </main>
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

function IssuesPanel({ evaluation }: { evaluation: OrderEvaluation }) {
  const issues = evaluation.results.filter(
    (result) => result.status === "fail" || result.status === "unsupported",
  );

  return (
    <article>
      <h3>Issues</h3>
      {issues.length === 0 ? (
        <p className="empty success">No issues found.</p>
      ) : (
        <ul className="issue-list">
          {issues.map((issue) => (
            <li className={issue.severity} key={issue.ruleId}>
              <strong>{issue.path}</strong>
              <span>{issue.message}</span>
              <code>actual: {JSON.stringify(issue.actual)}</code>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function RuleResultsTable({ evaluation }: { evaluation: OrderEvaluation }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Rule</th>
            <th>Path</th>
            <th>Status</th>
            <th>Actual</th>
          </tr>
        </thead>
        <tbody>
          {evaluation.results.map((result) => (
            <tr key={result.ruleId}>
              <td>{result.ruleId}</td>
              <td>{result.path}</td>
              <td>
                <span className={`result ${result.status}`}>{result.status}</span>
              </td>
              <td>{JSON.stringify(result.actual)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status ${status}`}>{status}</span>;
}

function countStatuses(evaluations: OrderEvaluation[]) {
  return evaluations.reduce<Record<OrderStatus, number>>(
    (summary, evaluation) => {
      summary[evaluation.status] += 1;
      return summary;
    },
    { valid: 0, warning: 0, blocked: 0 },
  );
}

function customerName(code: unknown) {
  const customer = customers.find((item) => item.code === code);
  return customer ? `${customer.name} (${customer.code})` : String(code ?? "unknown");
}

