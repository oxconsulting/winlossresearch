/**
 * src/components/win-loss-tool/UploadStep.jsx
 *
 * Step 1: CSV drop/upload zone. Ported from crm_diagnostic_tool-v1.jsx
 * (Step 1: Upload section). The artifact's usePapaParse() hook (which
 * lazily injected the PapaParse CDN <script> tag) is removed and replaced
 * with a static `import Papa from 'papaparse'` — a direct, required
 * consequence of moving PapaParse from a CDN script tag to an npm
 * dependency per the integration brief, not a change to parsing logic.
 * No other behavior changed.
 */
import { useState, useRef } from 'react';
import Papa from 'papaparse';

function UploadStep({ onParsed }) {
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file."); return; }
    setError(null);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) { setError(`Parse error: ${results.errors[0].message}`); return; }
        onParsed({ filename: file.name, headers: results.meta.fields || [], rows: results.data });
      },
      error: (err) => setError(`Failed to parse: ${err.message}`),
    });
  }

  return (
    <div>
      <div
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current.click()}
        style={{ border: `2px dashed ${dragging ? "var(--gold)" : "var(--tool-border-secondary)"}`, borderRadius: "var(--radius-sm)", padding: "52px 32px", textAlign: "center", cursor: "pointer", background: dragging ? "var(--tool-info-bg)" : "var(--paper)", transition: "all 0.15s" }}
      >
        <input ref={inputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
        <i className="ti ti-upload" aria-hidden="true" style={{ fontSize: 28, color: "var(--ink)", display: "block", marginBottom: 12 }} />
        <p style={{ fontWeight: 500, fontSize: 17, color: "var(--ink)", margin: "0 0 6px" }}>Drop your CRM export here</p>
        <p style={{ fontSize: 18, color: "var(--tool-text-secondary)", margin: "0 0 20px" }}>Accepts .csv files from any CRM</p>
        <button style={{ background: "var(--gold)", color: "var(--ink)", borderColor: "var(--gold)", fontSize: 18 }}>Choose file</button>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "var(--muted)", textAlign: "center", maxWidth: 380, margin: "16px auto 0", lineHeight: 1.65 }}>
          <i className="ti ti-lock" aria-hidden="true" style={{ fontSize: 18, color: "var(--muted)", marginRight: 5, verticalAlign: -1 }} />
          Your data never leaves your browser. When you upload your CRM export, the file is read directly on your device — the same way you'd open a spreadsheet locally. Nothing is sent to a server, stored in a database, or visible to anyone other than you. The moment you close or refresh this page, the session resets and nothing is saved.
        </p>
      </div>
      {error && (
        <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--tool-danger-bg)", border: "1px solid var(--tool-danger-border)", borderRadius: "var(--radius-sm)", color: "var(--tool-danger-fg)", fontSize: 18 }}>
          <i className="ti ti-alert-circle" aria-hidden="true" style={{ marginRight: 8, verticalAlign: -2 }} />{error}
        </div>
      )}
    </div>
  );
}

export default UploadStep;
