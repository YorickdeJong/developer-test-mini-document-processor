import { useMemo, useState } from "react";
import documents from "./data/documents.json";
import { buildExportPayload } from "./lib/export";
import { FIELD_LABELS, FIELD_ORDER } from "./lib/fields";
import { createInitialRecords } from "./lib/records";
import { getDocumentStatus } from "./lib/status";
import type {
  DocumentRecord,
  DocumentStatus,
  ExtractedFields,
  FieldName,
  SourceDocument,
} from "./lib/types";
import { validateExtraction } from "./lib/validation";

const sourceDocuments = documents as SourceDocument[];

export default function App() {
  const [records, setRecords] = useState<DocumentRecord[]>(() =>
    createInitialRecords(sourceDocuments),
  );
  const [selectedId, setSelectedId] = useState(records[0]?.source.id);

  const selected = records.find((record) => record.source.id === selectedId);
  const validation = selected
    ? validateExtraction(selected.fields)
    : { valid: false, issues: [] };
  const exportPayload =
    selected && validation.valid ? buildExportPayload(selected.source, selected.fields) : null;

  const counts = useMemo(() => {
    return records.reduce<Record<DocumentStatus, number>>(
      (summary, record) => {
        summary[getDocumentStatus(record)] += 1;
        return summary;
      },
      { new: 0, needs_review: 0, ready: 0, exported: 0 },
    );
  }, [records]);

  function updateSelectedFields(fields: ExtractedFields) {
    if (!selected) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.source.id === selected.source.id
          ? { ...record, fields, approved: false, exported: false }
          : record,
      ),
    );
  }

  function updateSelectedNote(reviewNote: string) {
    if (!selected) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.source.id === selected.source.id ? { ...record, reviewNote } : record,
      ),
    );
  }

  function approveSelected() {
    if (!selected || !validation.valid) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.source.id === selected.source.id ? { ...record, approved: true } : record,
      ),
    );
  }

  function markSelectedExported() {
    if (!selected || !selected.approved) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.source.id === selected.source.id ? { ...record, exported: true } : record,
      ),
    );
  }

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Developer test starter</p>
        <h1>Mini Document Processor</h1>
        <p>
          Process messy logistics documents into validated, export-ready JSON.
          The workflow shell is wired; the interview work is to improve the
          extraction, validation, review flow, tests, and handoff.
        </p>
      </header>

      <section className="summary-grid" aria-label="Document status summary">
        {Object.entries(counts).map(([status, count]) => (
          <div className="summary-tile" key={status}>
            <span>{status.replace("_", " ")}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </section>

      <section className="workspace">
        <aside className="inbox" aria-label="Document inbox">
          <div className="panel-heading">
            <h2>Inbox</h2>
            <span>{records.length} docs</span>
          </div>
          <div className="document-list">
            {records.map((record) => (
              <button
                className={
                  record.source.id === selectedId ? "document active" : "document"
                }
                key={record.source.id}
                onClick={() => setSelectedId(record.source.id)}
                type="button"
              >
                <span>{record.source.fileName}</span>
                <small>{record.source.receivedAt}</small>
                <StatusBadge status={getDocumentStatus(record)} />
              </button>
            ))}
          </div>
        </aside>

        <section className="document-view" aria-label="Selected document">
          {selected ? (
            <>
              <div className="panel-heading document-heading">
                <div>
                  <h2>{selected.source.fileName}</h2>
                  <span>{selected.source.id}</span>
                </div>
                <StatusBadge status={getDocumentStatus(selected)} />
              </div>

              <div className="document-grid">
                <article className="source-panel">
                  <h3>Original document</h3>
                  <pre>{selected.source.rawText}</pre>
                </article>

                <ReviewForm
                  fields={selected.fields}
                  note={selected.reviewNote}
                  onApprove={approveSelected}
                  onChange={updateSelectedFields}
                  onNoteChange={updateSelectedNote}
                  valid={validation.valid}
                />

                <ValidationPanel validation={validation} />

                <article className="export-panel">
                  <div className="section-heading">
                    <h3>Export preview</h3>
                    <button
                      disabled={!selected.approved}
                      onClick={markSelectedExported}
                      type="button"
                    >
                      Mark exported
                    </button>
                  </div>
                  {exportPayload ? (
                    <pre>{JSON.stringify(exportPayload, null, 2)}</pre>
                  ) : (
                    <p className="empty">
                      Fix validation issues before this document can be exported.
                    </p>
                  )}
                </article>
              </div>
            </>
          ) : (
            <p>No document selected.</p>
          )}
        </section>
      </section>
    </main>
  );
}

function ReviewForm({
  fields,
  note,
  onApprove,
  onChange,
  onNoteChange,
  valid,
}: {
  fields: ExtractedFields;
  note: string;
  onApprove: () => void;
  onChange: (fields: ExtractedFields) => void;
  onNoteChange: (note: string) => void;
  valid: boolean;
}) {
  function updateField(field: FieldName, value: string) {
    onChange({ ...fields, [field]: value });
  }

  return (
    <article className="review-panel">
      <div className="section-heading">
        <h3>Review fields</h3>
        <button disabled={!valid} onClick={onApprove} type="button">
          Approve
        </button>
      </div>
      <div className="form-grid">
        {FIELD_ORDER.map((field) => (
          <label key={field}>
            <span>{FIELD_LABELS[field]}</span>
            <input
              onChange={(event) => updateField(field, event.target.value)}
              value={String(fields[field] ?? "")}
            />
          </label>
        ))}
        <label className="wide">
          <span>Review note</span>
          <textarea
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            value={note}
          />
        </label>
      </div>
    </article>
  );
}

function ValidationPanel({
  validation,
}: {
  validation: ReturnType<typeof validateExtraction>;
}) {
  return (
    <article className="validation-panel">
      <h3>Validation</h3>
      {validation.issues.length === 0 ? (
        <p className="empty success">No issues found.</p>
      ) : (
        <ul className="issue-list">
          {validation.issues.map((issue) => (
            <li className={issue.severity} key={`${issue.field}-${issue.message}`}>
              <strong>{FIELD_LABELS[issue.field]}</strong>
              <span>{issue.message}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  return <span className={`status ${status}`}>{status.replace("_", " ")}</span>;
}

