import { useMemo, useState } from "react";
import documents from "./data/documents.json";
import { extractDocumentFields } from "./lib/extraction";
import { validateExtraction } from "./lib/validation";
import type { SourceDocument } from "./lib/types";

const sourceDocuments = documents as SourceDocument[];

export default function App() {
  const [selectedId, setSelectedId] = useState(sourceDocuments[0]?.id);
  const selected = sourceDocuments.find((document) => document.id === selectedId);

  const extracted = useMemo(
    () => (selected ? extractDocumentFields(selected) : {}),
    [selected],
  );
  const validation = useMemo(() => validateExtraction(extracted), [extracted]);

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Developer test starter</p>
        <h1>Mini Document Processor</h1>
        <p>
          Turn messy order documents into validated, export-ready JSON. The app
          shell and seed data are provided; the extraction, review, validation,
          export, and tests are the interview task.
        </p>
      </header>

      <section className="workspace">
        <aside className="inbox" aria-label="Document inbox">
          <div className="panel-heading">
            <h2>Inbox</h2>
            <span>{sourceDocuments.length} docs</span>
          </div>
          <div className="document-list">
            {sourceDocuments.map((document) => (
              <button
                className={document.id === selectedId ? "document active" : "document"}
                key={document.id}
                onClick={() => setSelectedId(document.id)}
                type="button"
              >
                <span>{document.fileName}</span>
                <small>{document.receivedAt}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="document-view" aria-label="Selected document">
          {selected ? (
            <>
              <div className="panel-heading">
                <div>
                  <h2>{selected.fileName}</h2>
                  <span>{selected.id}</span>
                </div>
                <span className={validation.valid ? "status ready" : "status review"}>
                  {validation.valid ? "ready" : "needs review"}
                </span>
              </div>

              <div className="split">
                <article>
                  <h3>Original</h3>
                  <pre>{selected.rawText}</pre>
                </article>
                <article>
                  <h3>Current extraction output</h3>
                  <pre>{JSON.stringify(extracted, null, 2)}</pre>
                  <h3>Validation</h3>
                  <pre>{JSON.stringify(validation, null, 2)}</pre>
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

