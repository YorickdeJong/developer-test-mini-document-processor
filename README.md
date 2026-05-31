# Mini Document Processor

This is a 60-minute developer test starter repo.

You are building a small local app that processes messy incoming order documents.
The starter already includes a document inbox, editable review form, validation
panel, export preview, and basic status tracking. Your job is to turn this into a
coherent, trustworthy document-processing workflow.

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

Build the best coherent slice you can. The starter already does some of this
partially; improve the parts that matter most.

1. **Inbox**
   - Show the 6 source documents.
   - Track document status: `new`, `needs_review`, `ready`, `exported`.
   - Improve the status rules if the current behavior is not right.

2. **Extraction**
   - Improve extraction for these fields:
     - `customer`
     - `referenceNumber`
     - `pickupDate`
     - `deliveryAddress`
     - `weightKg`

3. **Validation**
   - Flag missing customer.
   - Flag invalid or missing pickup date.
   - Flag missing or non-numeric weight.
   - Make validation messages useful to an operator.

4. **Review**
   - Let a user edit extracted fields.
   - Let a user approve a document only when it is valid.
   - Make the review experience clear enough that an operator can trust it.

5. **Export**
   - Show or download JSON for approved documents.
   - Ensure exported values are cleanly typed.

6. **Verification**
   - Add or improve at least one meaningful automated test for extraction,
     validation, status, or export logic.
   - Leave a short note in this README or a new `NOTES.md` explaining what works,
     what is unfinished, and how you used agents.

## Stretch Goals

Only do these after the core flow works:

- Confidence scores.
- Duplicate detection.
- Batch export.
- Customer-code lookup table.
- Side-by-side original document and editable extraction form.
- "Why flagged?" explanations.
- Markdown operations summary.
- Persist changes in local storage.
- Add a second document type.

## Existing Starter

- `src/data/documents.json` contains the messy source documents.
- `src/App.tsx` wires the document inbox, review form, validation panel, and export preview.
- `src/lib/extraction.ts` contains basic deterministic extraction that intentionally misses edge cases.
- `src/lib/validation.ts` contains a partial validation implementation.
- `src/lib/status.ts` derives document status from review/export state.
- `src/lib/export.ts` contains a basic export payload helper.
- `src/lib/__tests__/` shows the test setup.

You may change any of this.
