# Rubric

Score the session, not only the final app.

## 1. Project Management and Agent Orchestration — 25%

Strong signals:

- Creates a short plan before delegating.
- Splits work into bounded streams: rule engine, UI, tests, data modeling, QA/docs.
- Integrates continuously instead of waiting until the end.
- Keeps ownership of architecture instead of accepting agent output blindly.
- Adjusts scope when time gets tight.

Weak signals:

- Prompts an agent to "build the whole app" without decomposition.
- Lets agents create conflicting patterns or unreviewed code.
- Spends too long on styling before rule correctness works.

## 2. Working Product Slice — 25%

Strong signals:

- Orders clearly show valid/warning/blocked status.
- Rule results are understandable and grounded in actual values.
- Editing an order reruns validation.
- Export output includes only valid orders.
- The workflow is coherent even if small.

Weak signals:

- Mostly static UI.
- Statuses do not reflect the rules.
- Export ignores validation.

## 3. Code Quality and Architecture — 20%

Strong signals:

- Keeps rule evaluation pure and testable.
- Separates domain logic from React rendering.
- Uses clear TypeScript types.
- Handles missing, malformed, and nested data deliberately.
- Avoids hardcoding sample-order-specific fixes.

Weak signals:

- Business logic lives entirely inside JSX.
- Rule handling is a chain of one-off sample hacks.
- Generated code is large, duplicated, or unexplained.

## 4. Testing and Verification — 15%

Strong signals:

- Adds meaningful tests for rule behavior, edge cases, or export behavior.
- Runs tests and the app.
- Explains remaining verification gaps honestly.

Weak signals:

- No tests.
- Tests only check that components render without exercising behavior.
- Does not run anything.

## 5. Communication and Questions — 10%

Strong signals:

- Asks clarifying questions about ambiguous rule semantics.
- Narrates decisions and tradeoffs.
- Can explain what is implemented, mocked, unfinished, and risky.

Weak signals:

- Works silently while agents make major decisions.
- Cannot explain the code they shipped.

## 6. Polish — 5%

Strong signals:

- UI is readable and task-focused.
- Labels and validation messages are understandable.
- The final handoff notes are concise.

