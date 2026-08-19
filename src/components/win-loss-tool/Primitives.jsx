/**
 * src/components/win-loss-tool/Primitives.jsx
 *
 * Shared presentational primitives for the CRM diagnostic tool
 * (SectionLabel, StatChip, Tag, Flag, CoverageMeter, WinRateRow,
 * ReasonRow, AnalysisBlock, DimensionSection).
 *
 * Ported from crm_diagnostic_tool-v1.jsx (Shared primitives section).
 * Inline styles preserved as-is per Daniel's instruction; only the CSS
 * custom-property references were remapped from the artifact's local
 * :root shim to real winlossresearch.com tokens:
 *   --paper / --paper-2 / --ink / --muted / --gold   → global.css, unchanged
 *   --radius-sm                                       → replaces both
 *     --border-radius-md and --border-radius-lg (both were 3px in the
 *     artifact and --radius-sm is 3px in global.css — exact match)
 *   --tool-* (border/text/danger/warning/success/info) → new tokens
 *     scoped to .win-loss-tool in global.css; this tool is the one
 *     documented exception to the site's gold-only accent rule (coverage
 *     meters, win/loss tags, and hypothesis flags need semantic color).
 *     See global.css "Win/Loss Analysis Tool" section.
 */
import { useState } from 'react';

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionLabel({ children, style = {} }) {
  return (
    <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 7, ...style }}>
      <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
      {children}
    </p>
  );
}

function StatChip({ label, value, accent, sub }) {
  return (
    <div style={{
      background: accent ? "var(--tool-success-bg)" : "var(--paper-2)",
      border: accent ? "1px solid var(--tool-success-border)" : "none",
      borderRadius: "var(--radius-sm)", padding: "10px 16px", minWidth: 110,
    }}>
      <div style={{ fontSize: 17, color: accent ? "var(--tool-success-fg)" : "var(--tool-text-secondary)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, color: accent ? "var(--tool-success-fg)" : "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Tag({ children, color = "secondary", style = {} }) {
  const map = {
    danger:    ["var(--tool-danger-bg)",  "var(--tool-danger-fg)"],
    warning:   ["var(--tool-warning-bg)", "var(--tool-warning-fg)"],
    success:   ["var(--tool-success-bg)", "var(--tool-success-fg)"],
    secondary: ["var(--paper-2)","var(--tool-text-secondary)"],
    info:      ["var(--tool-info-bg)", "var(--ink)"],
  };
  const [bg, fg] = map[color] || map.secondary;
  return (
    <span style={{ display: "inline-block", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 2, background: bg, color: fg, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

function Flag({ children, color = "warning" }) {
  const map = {
    warning: ["var(--tool-warning-bg)", "var(--gold)", "var(--tool-warning-fg)", "ti-alert-triangle"],
    danger:  ["var(--tool-danger-bg)",  "var(--tool-danger-border)",  "var(--tool-danger-fg)",  "ti-alert-circle"],
    info:    ["var(--tool-info-bg)", "var(--gold)", "var(--ink)", "ti-info-circle"],
  };
  const [bg, border, fg, icon] = map[color] || map.warning;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", background: bg, border: `0.5px solid ${border}`, borderRadius: "var(--radius-sm)", fontSize: 18, color: fg, marginTop: 10 }}>
      <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}

// Coverage meter bar: green < 10%, yellow 10–30%, red > 30%
function CoverageMeter({ label, count, total, invert = false }) {
  const pct = total ? count / total : 0;
  const color = pct > 0.3 ? "var(--tool-danger-fg)" : pct > 0.1 ? "var(--tool-warning-fg)" : "var(--tool-success-fg)";
  const bg    = pct > 0.3 ? "var(--tool-danger-bg)" : pct > 0.1 ? "var(--tool-warning-bg)" : "var(--tool-success-bg)";
  const bar   = pct > 0.3 ? "var(--tool-danger-fg)" : pct > 0.1 ? "var(--gold)" : "var(--tool-success-fg)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--tool-border-tertiary)" }}>
      <span style={{ flex: 1, fontSize: 18, color: "var(--ink)" }}>{label}</span>
      <div style={{ width: 140, height: 6, background: "var(--paper-2)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${Math.round(pct * 100)}%`, height: "100%", background: bar, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 17, minWidth: 36, textAlign: "right", color, fontWeight: 500 }}>{Math.round(pct * 100)}%</span>
      <span style={{ fontSize: 11, color: "var(--muted)", minWidth: 52 }}>{count} / {total}</span>
    </div>
  );
}

// Win rate row for dimension breakdowns
function WinRateRow({ dim, wins, total, rate, overallRate, isLast }) {
  const thin = total < 3;
  const barColor = rate >= overallRate ? "var(--tool-success-border)" : "var(--tool-danger-border)";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 52px", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: isLast ? "none" : "1px solid var(--tool-border-tertiary)", opacity: thin ? 0.6 : 1 }}>
      <span style={{ fontSize: 18, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {dim}
        {thin && <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 6, fontStyle: "italic" }}>thin</span>}
      </span>
      <span style={{ fontSize: 17, color: "var(--tool-text-secondary)", textAlign: "right" }}>{wins}W / {total - wins}L</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 6, background: "var(--paper-2)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${Math.round(rate * 100)}%`, height: "100%", background: barColor, borderRadius: 3 }} />
        </div>
        {/* average marker */}
        <div style={{ position: "relative", width: 0 }}>
          <div style={{ position: "absolute", top: -8, left: `calc(${Math.round(overallRate * 100)}% - 68px)`, width: 1, height: 16, background: "var(--muted)", opacity: 0.4 }} />
        </div>
      </div>
      <span style={{ fontSize: 17, fontWeight: 500, color: rate >= overallRate ? "var(--tool-success-fg)" : "var(--tool-danger-fg)", textAlign: "right" }}>
        {Math.round(rate * 100)}%
      </span>
    </div>
  );
}

// Reason distribution row
function ReasonRow({ reason, count, total, pct, isLast }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 52px", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: isLast ? "none" : "1px solid var(--tool-border-tertiary)", background: "transparent" }}>
      <span style={{ fontSize: 18, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {reason}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, height: 5, background: "var(--paper-2)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${Math.round(pct * 100)}%`, height: "100%", background: "var(--gold)", borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 17, color: "var(--tool-text-secondary)", minWidth: 28, textAlign: "right" }}>{count}</span>
      </div>
      <span style={{ fontSize: 17, fontWeight: 500, color: "var(--tool-text-secondary)", textAlign: "right" }}>
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}

// Collapsible analysis block
function AnalysisBlock({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--tool-border-tertiary)", borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 16 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", background: "var(--paper-2)", border: "none", borderBottom: open ? "1px solid var(--tool-border-secondary)" : "none", cursor: "pointer", textAlign: "left" }}
      >
        <i className={`ti ${icon}`} aria-hidden="true" style={{ fontSize: 18, color: "var(--ink)" }} />
        <span style={{ flex: 1, fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700, color: "var(--ink)" }}>{title}</span>
        <i className={`ti ti-chevron-${open ? "up" : "down"}`} aria-hidden="true" style={{ fontSize: 16, color: "var(--muted)" }} />
      </button>
      {open && <div style={{ padding: "0" }}>{children}</div>}
    </div>
  );
}

// Win rate breakdown sub-section (collapsible within analysis block)
function DimensionSection({ title, rows, overallRate }) {
  const [open, setOpen] = useState(false);
  if (rows.length === 0) return null;
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "transparent", border: "none", borderTop: "1px solid var(--tool-border-tertiary)", cursor: "pointer", textAlign: "left" }}
      >
        <i className={`ti ti-chevron-${open ? "down" : "right"}`} aria-hidden="true" style={{ fontSize: 17, color: "var(--muted)" }} />
        <span style={{ fontSize: 17, fontWeight: 500, color: "var(--tool-text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</span>
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>{rows.length} groups</span>
      </button>
      {open && rows.map((r, i) => (
        <WinRateRow key={r.dim} {...r} overallRate={overallRate} isLast={i === rows.length - 1} />
      ))}
    </div>
  );
}

export {
  SectionLabel, StatChip, Tag, Flag, CoverageMeter,
  WinRateRow, ReasonRow, AnalysisBlock, DimensionSection,
};
