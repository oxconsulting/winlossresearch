/**
 * src/components/win-loss-tool/FilterStep.jsx
 *
 * Step 3: date-window filtering, exclusion-reason breakdown, and a
 * preview of included/excluded records. Ported verbatim from
 * crm_diagnostic_tool-v1.jsx (Step 3: Filter section) — no logic changes.
 * Token remapping: see Primitives.jsx header comment.
 */
import { useState } from 'react';
import { filterAndNormalize } from '../../lib/win-loss-tool/dataProcessing';
import { StatChip, SectionLabel, Tag } from './Primitives';

const WINDOW_OPTIONS = [30, 60, 90, 180, 365];


function FilterStep({ filename, mapping, rows, onAnalyze, onReset }) {
  const [windowDays, setWindowDays] = useState(180);
  const [showExcluded, setShowExcluded] = useState(false);

  const { included, excluded, detectedFormat } = filterAndNormalize(rows, mapping, windowDays);
  const totalParsed = rows.length;
  const inclPct = totalParsed ? Math.round((included.length / totalParsed) * 100) : 0;

  const reasonCounts = {};
  for (const r of excluded) {
    for (const reason of r.reasons) {
      const bucket =
        reason.includes("outside") || reason.includes("window") ? "Outside date window" :
        reason.includes("future")                                ? "Future close date" :
        reason.includes("unparseable") && reason.includes("Date") ? "Date unparseable" :
        reason.includes("Outcome")                               ? "Outcome not Win/Loss" :
        reason.includes("email")                                 ? "Email missing" :
        reason.includes("Deal value")                            ? "Deal value $0 or blank" : reason;
      reasonCounts[bucket] = (reasonCounts[bucket] || 0) + 1;
    }
  }
  const reasonList = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
  const fmtDate = (d) => d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const fmtVal  = (v) => v != null ? `$${v.toLocaleString()}` : "—";

  return (
    <div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--tool-info-bg)", borderRadius: "var(--radius-sm)", padding: "5px 12px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", color: "var(--ink)", marginBottom: 20 }}>
        <i className="ti ti-file-text" aria-hidden="true" style={{ fontSize: 16 }} />{filename}
      </div>
      <div style={{ marginBottom: 20, padding: "10px 14px", background: "var(--paper-2)", borderRadius: "var(--radius-sm)", fontSize: 17, color: "var(--tool-text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
        <i className="ti ti-calendar" aria-hidden="true" style={{ fontSize: 16, color: "var(--gold)", flexShrink: 0 }} />
        <span>Date format detected: <strong style={{ fontFamily: "var(--font-mono)" }}>{detectedFormat.replace("_ambiguous", "")}</strong>
          {detectedFormat.includes("ambiguous") && <span style={{ color: "var(--tool-warning-fg)", marginLeft: 8 }}><i className="ti ti-alert-triangle" aria-hidden="true" style={{ marginRight: 4, fontSize: 17 }} />MM/DD ambiguous — defaulting to MM/DD/YYYY (US format)</span>}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18, color: "var(--tool-text-secondary)", fontWeight: 500 }}>Date window:</span>
        {WINDOW_OPTIONS.map(d => (
          <button key={d} onClick={() => setWindowDays(d)} style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", padding: "6px 14px", background: windowDays === d ? "var(--gold)" : "var(--paper-2)", color: windowDays === d ? "var(--ink)" : "var(--tool-text-secondary)", border: `1px solid ${windowDays === d ? "var(--gold)" : "var(--tool-border-secondary)"}`, borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: windowDays === d ? 600 : 400 }}>{d}d</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatChip label="Total records" value={totalParsed.toLocaleString()} />
        <StatChip label="Passed filters" value={included.length.toLocaleString()} accent />
        <StatChip label="Excluded" value={excluded.length.toLocaleString()} />
        <StatChip label="Pass rate" value={`${inclPct}%`} />
      </div>
      {reasonList.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>Exclusion reasons</SectionLabel>
          <div style={{ background: "var(--paper)", border: "1px solid var(--tool-border-tertiary)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            {reasonList.map(([reason, count], i) => {
              const pct = Math.round((count / totalParsed) * 100);
              return (
                <div key={reason} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: i < reasonList.length - 1 ? "1px solid var(--tool-border-tertiary)" : "none" }}>
                  <span style={{ flex: 1, fontSize: 18, color: "var(--ink)" }}>{reason}</span>
                  <div style={{ width: 120, height: 4, background: "var(--paper-2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(pct * 3, 100)}%`, height: "100%", background: "var(--tool-danger-border)", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 17, color: "var(--tool-text-secondary)", minWidth: 32, textAlign: "right" }}>{count}</span>
                  <Tag color="secondary">{pct}%</Tag>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {included.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>{included.length} records passing filters</SectionLabel>
          <div style={{ background: "var(--paper)", border: "1px solid var(--tool-border-tertiary)", borderRadius: "var(--radius-sm)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
              <thead>
                <tr style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--tool-border-tertiary)" }}>
                  {["Company", "Outcome", "Close date", "Deal value", "Rep", "Close reason"].map(h => (
                    <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 500, fontSize: 11, color: "var(--tool-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {included.slice(0, 10).map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < Math.min(included.length, 10) - 1 ? "1px solid var(--tool-border-tertiary)" : "none" }}>
                    <td style={{ padding: "8px 12px", color: "var(--ink)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.company}</td>
                    <td style={{ padding: "8px 12px" }}><Tag color={r.outcome === "Win" ? "success" : "danger"}>{r.outcome}</Tag></td>
                    <td style={{ padding: "8px 12px", color: "var(--tool-text-secondary)", whiteSpace: "nowrap" }}>{fmtDate(r.close_date)}</td>
                    <td style={{ padding: "8px 12px", color: "var(--tool-text-secondary)", whiteSpace: "nowrap" }}>{fmtVal(r.deal_value)}</td>
                    <td style={{ padding: "8px 12px", color: "var(--tool-text-secondary)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.rep || "—"}</td>
                    <td style={{ padding: "8px 12px", color: "var(--tool-text-secondary)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.close_reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {included.length > 10 && <div style={{ padding: "10px 16px", fontSize: 17, color: "var(--muted)", borderTop: "1px solid var(--tool-border-tertiary)" }}>Showing 10 of {included.length.toLocaleString()} — full dataset passed to analysis</div>}
          </div>
        </div>
      )}
      {excluded.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => setShowExcluded(v => !v)} style={{ fontSize: 17, background: "none", border: "none", cursor: "pointer", color: "var(--tool-text-secondary)", padding: 0, display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <i className={`ti ti-chevron-${showExcluded ? "down" : "right"}`} aria-hidden="true" style={{ fontSize: 18 }} />
            <SectionLabel style={{ margin: 0 }}>{excluded.length} excluded records</SectionLabel>
          </button>
          {showExcluded && (
            <div style={{ background: "var(--paper)", border: "1px solid var(--tool-border-tertiary)", borderRadius: "var(--radius-sm)", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 17 }}>
                <thead>
                  <tr style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--tool-border-tertiary)" }}>
                    {["Company", "Raw outcome", "Close date", "Deal value", "Exclusion reasons"].map(h => (
                      <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 500, fontSize: 11, color: "var(--tool-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excluded.slice(0, 50).map((r, i) => (
                    <tr key={i} style={{ borderBottom: i < Math.min(excluded.length, 50) - 1 ? "1px solid var(--tool-border-tertiary)" : "none" }}>
                      <td style={{ padding: "8px 12px", color: "var(--ink)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.company}</td>
                      <td style={{ padding: "8px 12px", color: "var(--tool-text-secondary)", fontStyle: r._rawOutcome ? "normal" : "italic" }}>{r._rawOutcome || "blank"}</td>
                      <td style={{ padding: "8px 12px", color: "var(--tool-text-secondary)", whiteSpace: "nowrap" }}>{fmtDate(r._parsedDate)}</td>
                      <td style={{ padding: "8px 12px", color: "var(--tool-text-secondary)", whiteSpace: "nowrap" }}>{fmtVal(r.deal_value)}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {r.reasons.map((reason, ri) => <Tag key={ri} color="danger">{reason}</Tag>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {excluded.length > 50 && <div style={{ padding: "10px 16px", fontSize: 17, color: "var(--muted)", borderTop: "1px solid var(--tool-border-tertiary)" }}>Showing 50 of {excluded.length.toLocaleString()} excluded records</div>}
            </div>
          )}
        </div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => onAnalyze(included)} disabled={included.length === 0} style={{ fontSize: 18, background: included.length > 0 ? "var(--gold)" : "var(--paper-2)", color: included.length > 0 ? "var(--ink)" : "var(--muted)", border: `1px solid ${included.length > 0 ? "var(--gold)" : "var(--tool-border-secondary)"}`, cursor: included.length > 0 ? "pointer" : "not-allowed", opacity: included.length > 0 ? 1 : 0.6 }}>
          <i className="ti ti-chart-bar" aria-hidden="true" style={{ marginRight: 6 }} />Run analysis ({included.length.toLocaleString()} records)
        </button>
        <button onClick={onReset} style={{ fontSize: 17 }}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ marginRight: 6 }} />Start over
        </button>
      </div>
    </div>
  );
}

export default FilterStep;
