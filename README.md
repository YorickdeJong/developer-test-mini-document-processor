# Mini Document Processor

This is a 60-minute developer test starter repo.

You are building a small local app that processes messy incoming order documents.
The app should extract key fields, flag missing or invalid values, let a user review
and edit the result, and produce export-ready JSON for approved documents.

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

Build the best coherent slice you can:

1. **Inbox**
   - Show the 6 source documents.
   - Track document status: `new`, `needs_review`, `ready`, `exported`.

2. **Extraction**
   - Extract these fields from each document:
     - `customer`
     - `referenceNumber`
     - `pickupDate`
     - `deliveryAddress`
     - `weightKg`

3. **Validation**
   - Flag missing customer.
   - Flag invalid or missing pickup date.
   - Flag missing or non-numeric weight.

4. **Review**
   - Let a user edit extracted fields.
   - Let a user approve a document only when it is valid.

5. **Export**
   - Show or download JSON for approved documents.

6. **Verification**
   - Add at least one meaningful automated test for extraction, validation, or export logic.
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
- `src/lib/extraction.ts` contains an extraction stub.
- `src/lib/validation.ts` contains a partial validation implementation.
- `src/lib/export.ts` contains a basic export payload helper.
- `src/App.tsx` shows the initial document browser.

You may change any of this.

