# Rubric

Score the session, not only the final app.

## 1. Project Management and Agent Orchestration — 25%

Strong signals:

- Creates a short plan before delegating.
- Splits work into bounded streams: UI, extraction, validation, tests, QA/docs.
- Integrates continuously instead of waiting until the end.
- Keeps ownership of architecture instead of accepting agent output blindly.
- Adjusts scope when time gets tight.

Weak signals:

- Prompts an agent to "build the whole app" without decomposition.
- Lets agents create conflicting patterns or unreviewed code.
- Spends too long on setup or polish before a working slice exists.

## 2. Working Product Slice — 25%

Strong signals:

- A user can open documents, see extracted fields, understand validation issues,
  edit fields, approve valid documents, and view export JSON.
- The app handles at least the obvious bad documents.
- The workflow is coherent even if small.

Weak signals:

- Mostly static UI.
- No usable path from source document to export.
- Important state exists only in code comments or README claims.

## 3. Code Quality and Architecture — 20%

Strong signals:

- Separates extraction, validation, state, and rendering.
- Uses clear types.
- Keeps logic deterministic and inspectable.
- Handles edge cases without broad catch-all behavior.

Weak signals:

- Business logic lives entirely inside JSX.
- Hardcoded one-off handling for every document with no generalization.
- Generated code is large, duplicated, or unexplained.

## 4. Testing and Verification — 15%

Strong signals:

- Adds at least one meaningful test for extraction, validation, or export.
- Runs tests and the app.
- Explains remaining verification gaps honestly.

Weak signals:

- No tests.
- Tests only check that components render without exercising behavior.
- Does not run anything.

## 5. Communication and Questions — 10%

Strong signals:

- Asks clarifying questions about ambiguous business rules.
- Narrates decisions and tradeoffs.
- Can explain what is real, mocked, unfinished, and risky.

Weak signals:

- Works silently while agents make major decisions.
- Cannot explain the code they shipped.

## 6. Polish — 5%

Strong signals:

- UI is readable and task-focused.
- Labels and validation messages are understandable.
- The final handoff notes are concise.

