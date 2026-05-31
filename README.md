# Rules Engine Workbench

This is a 60-minute developer test starter repo.

You are building a small workbench for validating extracted logistics orders before
export. The repo intentionally uses local JSON inputs for the core task: no database,
no external services, and no required API calls.

You may use Claude Code, Codex, multiple agents, documentation, search, and any
reasonable local tools. You may ask the interviewer questions while working.

## Timebox

You have 60 minutes. We do not expect a perfect product. We care about how you
plan, split work, verify, and make tradeoffs.

## Setup

```bash
pnpm install
pnpm dev
```

Run tests:

```bash
pnpm test:run
```

## Core Scope

Build the best coherent slice you can. The starter already has a Next.js UI,
seed orders, seed rules, a partial rule evaluator, and a few passing tests.

1. **Order Overview**
   - Show all orders.
   - Show status: `valid`, `warning`, or `blocked`.
   - Make it easy to see which orders are exportable.

2. **Rule Evaluation**
   - Improve `src/lib/evaluateRules.ts`.
   - Support required fields.
   - Support min/max numbers.
   - Support allowed values via `oneOf`.
   - Support simple conditional rules with `when`.
   - Support nested paths like `addresses.delivery.postcode`.

3. **Operator Review**
   - Show per-order rule results.
   - Show severity, field/path, message, and actual value.
   - Let the user edit an order and rerun validation.
   - Make failure reasons understandable to an operator.

4. **Export**
   - Generate export-ready JSON for valid orders only.
   - Keep the export shape clean and predictable.

5. **Verification**
   - Add or improve at least one meaningful automated test for the rule engine,
     export behavior, or an edge case you fixed.
   - Leave a short note in this README or a new `NOTES.md` explaining what works,
     what is unfinished, and how you used agents.

## Stretch Goals

Only do these after the core flow works:

- Group issues by field/path.
- Add filtering by customer/status/severity.
- Explain why a conditional rule triggered or skipped.
- Add fix suggestions.
- Add a rule editor.
- Add date validation.
- Add batch export controls.
- Improve the visual hierarchy and empty states.

## Backend Stretch

The core task does not require backend work. If you finish early, wire the UI to
the prepared optional backend persistence layer:

- `GET /api/orders` returns runtime orders.
- `PATCH /api/orders/[id]` persists one edited order.
- `POST /api/reset` resets runtime orders from the seed data.
- `src/server/orderStore.ts` stores runtime state in `data/runtime/orders.json`.

`data/runtime/` is gitignored and generated on demand. This is deliberately a
simple file-backed store, not a database.

## Existing Starter

- `src/data/orders.json` contains extracted order payloads.
- `src/data/rules.json` contains validation rules.
- `src/data/customers.json` contains customer lookup data.
- `src/components/RulesWorkbench.tsx` renders the workbench.
- `src/lib/evaluateRules.ts` contains the partial evaluator.
- `src/lib/exportOrders.ts` builds the export payload.
- `src/lib/__tests__/evaluateRules.test.ts` shows the test setup.
- `src/app/api/**` contains the optional backend stretch routes.

You may change any of this.

