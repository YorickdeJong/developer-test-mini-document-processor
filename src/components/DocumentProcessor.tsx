"use client";

import { useEffect, useMemo, useState } from "react";
import { buildExportPayload } from "@/lib/export";
import { FIELD_LABELS, FIELD_ORDER } from "@/lib/fields";
import { getDocumentStatus } from "@/lib/status";
import type {
  DocumentRecord,
  DocumentStatus,
  ExtractedFields,
  FieldName,
} from "@/lib/types";
import { validateExtraction } from "@/lib/validation";

type ExportResponse = {
  record: DocumentRecord;
  payload: unknown;
};

export default function DocumentProcessor() {
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [draftFields, setDraftFields] = useState<ExtractedFields>({});
  const [draftNote, setDraftNote] = useState("");
  const [exportPayload, setExportPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDocuments();
  }, []);

  const selected = records.find((record) => record.source.id === selectedId);

  useEffect(() => {
    if (!selected) {
      setDraftFields({});
      setDraftNote("");
      setExportPayload(null);
      return;
    }

    setDraftFields(selected.fields);
    setDraftNote(selected.reviewNote);
    setExportPayload(null);
  }, [selected?.source.id]);

  const validation = validateExtraction(draftFields);
  const previewPayload =
    selected && validation.valid ? buildExportPayload(selected.source, draftFields) : null;

  const counts = useMemo(() => {
    return records.reduce<Record<DocumentStatus, number>>(
      (summary, record) => {
        summary[getDocumentStatus(record)] += 1;
        return summary;
      },
      { new: 0, needs_review: 0, ready: 0, exported: 0 },
    );
  }, [records]);

  async function loadDocuments() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/documents", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load documents.");
      }

      const nextRecords = (await response.json()) as DocumentRecord[];
      setRecords(nextRecords);
      setSelectedId((current) => current ?? nextRecords[0]?.source.id);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unknown load error.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSelected() {
    if (!selected) {
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${selected.source.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: draftFields, reviewNote: draftNote }),
      });

      if (!response.ok) {
        throw new Error("Could not save document review.");
      }

      const updated = (await response.json()) as DocumentRecord;
      updateRecord(updated);
      return updated;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unknown save error.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function approveSelected() {
    if (!selected || !validation.valid) {
      return;
    }

    const saved = await saveSelected();
    if (!saved) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${selected.source.id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not approve document.");
      }

      updateRecord((await response.json()) as DocumentRecord);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unknown approve error.");
    } finally {
      setSaving(false);
    }
  }

  async function exportSelected() {
    if (!selected || !selected.approved) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${selected.source.id}/export`, {
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not export document.");
      }

      const body = (await response.json()) as ExportResponse;
      updateRecord(body.record);
      setExportPayload(body.payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unknown export error.");
    } finally {
      setSaving(false);
    }
  }

  function updateRecord(updated: DocumentRecord) {
    setRecords((current) =>
      current.map((record) =>
        record.source.id === updated.source.id ? updated : record,
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
          The Next.js UI and SQLite-backed API are wired; improve the workflow
          until an operator can trust it.
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

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="workspace">
        <aside className="inbox" aria-label="Document inbox">
          <div className="panel-heading">
            <h2>Inbox</h2>
            <button onClick={loadDocuments} type="button">
              Reload
            </button>
          </div>

          {loading ? (
            <p className="empty">Loading documents...</p>
          ) : (
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
          )}
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
                  fields={draftFields}
                  note={draftNote}
                  onApprove={approveSelected}
                  onChange={setDraftFields}
                  onNoteChange={setDraftNote}
                  onSave={saveSelected}
                  saving={saving}
                  valid={validation.valid}
                />

                <ValidationPanel validation={validation} />

                <article className="export-panel">
                  <div className="section-heading">
                    <h3>Export preview</h3>
                    <button
                      disabled={!selected.approved || saving}
                      onClick={exportSelected}
                      type="button"
                    >
                      Export
                    </button>
                  </div>
                  {previewPayload ? (
                    <>
                      <pre>{JSON.stringify(exportPayload ?? previewPayload, null, 2)}</pre>
                      {!selected.approved ? (
                        <p className="hint">Approve before exporting.</p>
                      ) : null}
                    </>
                  ) : (
                    <p className="empty">
                      Fix validation issues before this document can be exported.
                    </p>
                  )}
                </article>
              </div>
            </>
          ) : (
            <p className="empty">No document selected.</p>
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
  onSave,
  saving,
  valid,
}: {
  fields: ExtractedFields;
  note: string;
  onApprove: () => void;
  onChange: (fields: ExtractedFields) => void;
  onNoteChange: (note: string) => void;
  onSave: () => void;
  saving: boolean;
  valid: boolean;
}) {
  function updateField(field: FieldName, value: string) {
    onChange({ ...fields, [field]: value });
  }

  return (
    <article className="review-panel">
      <div className="section-heading">
        <h3>Review fields</h3>
        <div className="button-row">
          <button disabled={saving} onClick={onSave} type="button">
            Save
          </button>
          <button disabled={!valid || saving} onClick={onApprove} type="button">
            Approve
          </button>
        </div>
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

