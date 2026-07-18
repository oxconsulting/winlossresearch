/**
 * src/components/win-loss-tool/MappingStep.jsx
 *
 * Step 2: field-mapping UI with fuzzy auto-map preview. Ported verbatim
 * from crm_diagnostic_tool-v1.jsx (Step 2: Mapping section) — no logic
 * changes. Token remapping: see Primitives.jsx header comment.
 */
import { useState, Fragment } from 'react';
import { STANDARD_FIELDS, autoMap } from '../../lib/win-loss-tool/fieldSchema';
import { StatChip, SectionLabel } from './Primitives';

function MappingStep({ filename, headers, rows, onConfirm, onReset }) {
  const [mapping, setMapping] = useState(() => autoMap(headers));
  const initialMapping = autoMap(headers);
  const preview = rows.slice(0, 3);
  const unmappedRequired = STANDARD_FIELDS.filter(f => f.required && !mapping[f.key]);
  const canConfirm = unmappedRequired.length === 0;
  const autoMappedCount = Object.values(initialMapping).filter(Boolean).length;

  function setFieldMapping(standardKey, clientHeader) {
    setMapping(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) { if (next[k] === clientHeader && k !== standardKey) next[k] = ""; }
      next[standardKey] = clientHeader;
      return next;
    });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatChip label="Total rows" value={rows.length.toLocaleString()} />
        <StatChip label="Columns detected" value={headers.length} />
        <StatChip label="Auto-mapped" value={autoMappedCount} />
        <StatChip label="Required fields" value={STANDARD_FIELDS.filter(f => f.required).length} />
      </div>
      <SectionLabel>Map your columns to standard fields</SectionLabel>
      {unmappedRequired.length > 0 && (
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "var(--tool-warning-bg)", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", fontSize: 18, color: "var(--tool-warning-fg)" }}>
          <i className="ti ti-alert-triangle" aria-hidden="true" style={{ marginRight: 8, verticalAlign: -2 }} />
          {unmappedRequired.length} required {unmappedRequired.length === 1 ? "field" : "fields"} unmapped:{" "}
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 17 }}>{unmappedRequired.map(f => f.label).join(", ")}</span>
        </div>
      )}
      <div style={{ background: "var(--paper)", border: "1px solid var(--tool-border-tertiary)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 130px", background: "var(--paper-2)", borderBottom: "1px solid var(--tool-border-tertiary)", padding: "9px 16px", gap: 12 }}>
          {["Standard field", "Your column", "Preview value"].map(lbl => (
            <span key={lbl} style={{ fontSize: 11, fontWeight: 500, color: "var(--tool-text-secondary)", textTransform: "uppercase", letterSpacing: "0.6px" }}>{lbl}</span>
          ))}
        </div>
        {(() => {
          const requiredFields = STANDARD_FIELDS.filter(f => f.required);
          const optionalFields = STANDARD_FIELDS.filter(f => !f.required);
          const orderedFields = [...requiredFields, ...optionalFields];

          const renderRow = (field, isLast, showSeparatorAbove) => {
            const mapped = mapping[field.key];
            const isAutoMapped = !!initialMapping[field.key] && initialMapping[field.key] === mapped;
            const isMissing = field.required && !mapped;
            let sampleVal = "";
            if (mapped) { for (const row of preview) { const v = row[mapped]; if (v && String(v).trim()) { sampleVal = String(v); break; } } }
            return (
              <Fragment key={field.key}>
                {showSeparatorAbove && (
                  <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 130px", gap: 12, padding: "7px 16px", background: "var(--paper-2)", borderTop: "1px solid var(--tool-border-tertiary)", borderBottom: "1px solid var(--tool-border-tertiary)" }}>
                    <span style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.7px", gridColumn: "1 / -1" }}>Optional fields</span>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 130px", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: isLast ? "none" : "1px solid var(--tool-border-tertiary)", background: isMissing ? "var(--tool-danger-bg)" : "transparent" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 18, fontWeight: 500, color: isMissing ? "var(--tool-danger-fg)" : "var(--ink)" }}>{field.label}</span>
                      {field.required && (
                        <span style={{ fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 4, background: isMissing ? "transparent" : "var(--paper-2)", color: isMissing ? "var(--tool-danger-fg)" : "var(--muted)", border: isMissing ? "1px solid var(--tool-danger-border)" : "none" }}>required</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontFamily: "var(--font-mono)" }}>{field.key}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <select value={mapped} onChange={(e) => setFieldMapping(field.key, e.target.value)} style={{ flex: 1, fontSize: 17, fontFamily: "var(--font-mono)", color: mapped ? "var(--ink)" : "var(--muted)", borderColor: isMissing ? "var(--tool-danger-border)" : undefined }}>
                      <option value="">— not mapped —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {isAutoMapped && <i className="ti ti-sparkles" aria-hidden="true" title="Auto-mapped" style={{ fontSize: 16, color: "var(--gold)", flexShrink: 0 }} />}
                  </div>
                  <div style={{ fontSize: 11, color: sampleVal ? "var(--tool-text-secondary)" : "var(--muted)", fontStyle: sampleVal ? "normal" : "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {sampleVal || (mapped ? "no data" : "—")}
                  </div>
                </div>
              </Fragment>
            );
          };

          return orderedFields.map((field, idx) => {
            const isLast = idx === orderedFields.length - 1;
            const showSeparator = idx === requiredFields.length; // first optional field
            return renderRow(field, isLast, showSeparator);
          });
        })()}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, fontSize: 17, color: "var(--muted)" }}>
        <span><i className="ti ti-sparkles" aria-hidden="true" style={{ marginRight: 5, color: "var(--ink)", fontSize: 18, verticalAlign: -2 }} />Auto-mapped</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "var(--tool-danger-bg)", border: "1px solid var(--tool-danger-border)" }} />
          Required field missing
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onConfirm(mapping)} disabled={!canConfirm} style={{ fontSize: 18, background: canConfirm ? "var(--gold)" : "var(--paper-2)", color: canConfirm ? "var(--ink)" : "var(--muted)", border: `1px solid ${canConfirm ? "var(--gold)" : "var(--tool-border-secondary)"}`, cursor: canConfirm ? "pointer" : "not-allowed", opacity: canConfirm ? 1 : 0.65 }}>
          <i className="ti ti-check" aria-hidden="true" style={{ marginRight: 6 }} />
          {canConfirm ? "Confirm mapping" : `Confirm mapping (${unmappedRequired.length} remaining)`}
        </button>
        <button onClick={onReset} style={{ fontSize: 17 }}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ marginRight: 6 }} />Upload a different file
        </button>
      </div>
    </div>
  );
}

export default MappingStep;
