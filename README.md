# Rules Engine Workbench

This is a 60-minute developer test starter repo.

You are building a small workbench for validating extracted logistics order JSON
before export. The repo intentionally uses local JSON inputs for the core task:
no database, no external services, and no required API calls.

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

## Product Goal

Build a workbench with three useful areas:

1. **Configure Rules** - create, edit, delete, and inspect validation rules.
2. **Input JSON** - paste or edit an array of extracted order payloads.
3. **Results** - evaluate the input against the configured rules and show what
   passes, warns, or blocks export.

The starter UI has these sections, seed data, a partial evaluator, and a small
test setup. It is deliberately incomplete.

## Constraints

- Stay in this Next.js/TypeScript project.
- Do not add auth, accounts, deployment, or external API dependencies.
- A database is not required for the core task.
- Prefer a coherent working slice over many unfinished ideas.
- Keep enough time at the end to run checks and explain your result.

## Core Scope

Build the best coherent slice you can.

1. **Rule configuration**
   - Let the user configure rules in the UI.
   - Support practical rule fields: `id`, `path`, `type`, `severity`, `message`,
     and type-specific values.
   - Include useful rule types such as `required`, `number`, `min`, `max`,
     `minLength`, `maxLength`, `oneOf`, `regex`, and `date`.
   - Support optional `when` conditions if time allows.

2. **JSON input**
   - Let the user paste/edit order JSON.
   - Show parse errors clearly.
   - Preserve user input while they iterate.

3. **Rule evaluation**
   - Improve `src/lib/evaluateRules.ts`.
   - Support nested paths like `addresses.delivery.postcode`.
   - Return useful result details: status, path, severity, message, actual value,
     expected value, and skipped conditional rules where relevant.

4. **Readable output**
   - Show per-order status: `valid`, `warning`, or `blocked`.
   - Make failed rules understandable to an operator.
   - Make it easy to see which orders are exportable.

5. **Verification**
   - Add or improve at least one meaningful automated test for the rule engine,
     JSON handling, export behavior, or an edge case you fixed.
   - Leave a short note in this README or a new `NOTES.md`.

## Handoff

Before the session ends, write a short note covering:

- what works,
- what is unfinished,
- what checks you ran,
- how you used agents,
- what you would do next with more time.

## Stretch Goals

Only do these after the core flow works:

- Add rule add/edit/delete forms instead of only JSON editing.
- Group issues by field/path.
- Add filtering by status/severity/customer.
- Explain why a conditional rule triggered or skipped.
- Add fix suggestions.
- Export valid orders only.
- Persist rules or input through the optional backend routes.
- Improve visual hierarchy and empty states.

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
- `src/data/rules.json` contains validation rule examples.
- `src/data/customers.json` contains customer lookup data.
- `src/components/RulesWorkbench.tsx` renders the starter workbench shell.
- `src/lib/evaluateRules.ts` contains the partial evaluator.
- `src/lib/exportOrders.ts` builds an export payload from valid orders.
- `src/lib/__tests__/evaluateRules.test.ts` shows the test setup.
- `src/app/api/**` contains the optional backend stretch routes.

You may change any of this.
