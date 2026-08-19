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
import { STANDARD_FIELDS } from '../../lib/win-loss-tool/fieldSchema';
import { MIN_RECORDS_REQUIRED } from '../../lib/win-loss-tool/dataProcessing';
import { Tag } from './Primitives';

// Derived from the schema (not hardcoded) so this panel can't drift out of
// sync with the required-field enforcement MappingStep applies.
const REQUIRED_FIELDS = STANDARD_FIELDS.filter(f => f.required);

function UploadStep({ onParsed }) {
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [showEmailInfo, setShowEmailInfo] = useState(false);
  const inputRef = useRef();

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setError("Please upload a .csv file."); return; }
    setError(null);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) { setError(`Parse error: ${results.errors[0].message}`); return; }
        if (results.data.length < MIN_RECORDS_REQUIRED) {
          setError(`This file has ${results.data.length} row${results.data.length === 1 ? "" : "s"} of data. At least ${MIN_RECORDS_REQUIRED} rows are needed for statistically meaningful win/loss analysis.`);
          return;
        }
        onParsed({ filename: file.name, headers: results.meta.fields || [], rows: results.data });
      },
      error: (err) => setError(`Failed to parse: ${err.message}`),
    });
  }

  return (
    <div>
      <div style={{ border: "1.5px solid var(--gold)", borderRadius: "var(--radius-sm)", padding: "18px 22px", marginBottom: 20, background: "#F7EFDA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "var(--gold)", color: "var(--ink)", flexShrink: 0 }}>
            <i className="ti ti-exclamation-mark" aria-hidden="true" style={{ fontSize: 13, fontWeight: 700 }} />
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Before you upload</span>
        </div>
        <p style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 22, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.3 }}>
          Your CSV must include these {REQUIRED_FIELDS.length} required fields:
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: "var(--tool-text-secondary)", marginBottom: 12 }}>
          <i className="ti ti-database" aria-hidden="true" style={{ fontSize: 14 }} />
          Minimum {MIN_RECORDS_REQUIRED} rows of data, for statistically meaningful results.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: showEmailInfo ? 10 : 12 }}>
          {REQUIRED_FIELDS.map(f => {
            const isEmail = f.key === "primary_contact_email";
            return (
              <span key={f.key} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Tag color="secondary" style={{ fontSize: 14, padding: "5px 12px" }}>
                  <i className="ti ti-check" aria-hidden="true" style={{ marginRight: 4, verticalAlign: -1 }} />
                  {f.shortLabel || f.label}
                </Tag>
                {isEmail && (
                  <button
                    type="button"
                    onClick={() => setShowEmailInfo(v => !v)}
                    aria-expanded={showEmailInfo}
                    aria-controls="email-field-explanation"
                    aria-label="Why is the email field required?"
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", color: "var(--muted)" }}
                  >
                    <i className="ti ti-info-circle" aria-hidden="true" style={{ fontSize: 16 }} />
                  </button>
                )}
              </span>
            );
          })}
        </div>
        {showEmailInfo && (
          <div id="email-field-explanation" style={{ background: "var(--paper-2)", borderLeft: "3px solid var(--gold)", padding: "10px 14px", marginBottom: 12, fontFamily: "var(--font-serif)", fontSize: 14.5, color: "var(--tool-text-secondary)", lineHeight: 1.6 }}>
            This tool doesn't store any data. The email field is used only to estimate how many of these buyers could realistically be reached for an interview — rows with a missing or malformed email can't be contacted, so they're excluded from that count.
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 17, color: "var(--muted)" }}>
          <i className="ti ti-file-text" aria-hidden="true" style={{ fontSize: 14 }} />
          Export recent opportunities as CSV. Any CRM supported.
        </div>
      </div>
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
