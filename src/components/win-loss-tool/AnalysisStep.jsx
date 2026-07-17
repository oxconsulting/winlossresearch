/**
 * src/components/win-loss-tool/AnalysisStep.jsx
 *
 * Step 4: renders coverage diagnostics, win-rate analysis, win/loss
 * attribution, interview candidate summary, and (on demand) the ranked
 * hypothesis list. Combines the artifact's "Hypothesis display component"
 * and "Analysis view" sections — they were tightly coupled in the source
 * (HypothesisBlock is only ever rendered from within AnalysisStep) and
 * splitting them into separate files would add an import for no reuse
 * benefit, per the file-split guidance to avoid over-fragmenting.
 *
 * Token remapping: same as Primitives.jsx — see that file's header comment.
 */
import { useState } from 'react';
import { runAnalysis } from '../../lib/win-loss-tool/analysisEngine';
import { generateHypotheses } from '../../lib/win-loss-tool/hypothesisEngine';
import { StatChip, Tag, AnalysisBlock, DimensionSection, ReasonRow, CoverageMeter } from './Primitives';

// ─── Hypothesis display component ─────────────────────────────────────────────

const HYPOTHESIS_TYPE_META = {
  segment:     { icon: "ti-target",      label: "Segment Performance",      color: "warning" },
  loss_reason: { icon: "ti-alert-circle", label: "Loss Reason Concentration", color: "danger"  },
  win_reason:  { icon: "ti-trophy",      label: "Win Reason Concentration",  color: "info"    },
};

function HypothesisBlock({ hypotheses }) {
  const colorMap = {
    warning: { bg: "var(--tool-warning-bg)", border: "var(--gold)", fg: "var(--tool-warning-fg)", fgLight: "var(--tool-warning-fg)" },
    danger:  { bg: "var(--tool-danger-bg)",  border: "var(--tool-danger-border)",  fg: "var(--tool-danger-fg)",  fgLight: "var(--tool-danger-fg)"  },
    info:    { bg: "var(--tool-info-bg)",    border: "var(--gold)",    fg: "var(--ink)",    fgLight: "var(--ink)"    },
  };

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.7px", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 4px" }}>Hypotheses to test</p>
        <p style={{ fontSize: 18, color: "var(--tool-text-secondary)", margin: 0 }}>
          {hypotheses.length} {hypotheses.length === 1 ? "hypothesis" : "hypotheses"} generated · ranked by signal strength
        </p>
      </div>

      {hypotheses.length === 0 ? (
        <div style={{ background: "var(--paper-2)", border: "1px solid var(--tool-border-tertiary)", borderRadius: "var(--radius-sm)", padding: "20px 20px", fontSize: 18, color: "var(--tool-text-secondary)", lineHeight: 1.6 }}>
          <i className="ti ti-info-circle" aria-hidden="true" style={{ marginRight: 8, color: "var(--muted)", fontSize: 17, verticalAlign: -2 }} />
          The data does not show strong enough concentration signals to generate prioritized hypotheses. Consider expanding the date range or reviewing close reason coding practices.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {hypotheses.map((h, i) => {
            const meta = HYPOTHESIS_TYPE_META[h.type] || HYPOTHESIS_TYPE_META.loss_reason;
            const c = colorMap[meta.color];
            return (
              <div key={i} style={{ background: "var(--paper)", border: `0.5px solid var(--tool-border-tertiary)`, borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: "var(--paper-2)", borderBottom: "1px solid var(--tool-border-tertiary)" }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 2, background: "var(--gold)", flexShrink: 0 }}>
                    <i className={`ti ${meta.icon}`} aria-hidden="true" style={{ fontSize: 17, color: "var(--ink)" }} />
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", flex: 1 }}>{meta.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", background: "var(--paper-2)", border: "1px solid var(--tool-border-secondary)", borderRadius: 4, padding: "2px 7px" }}>#{i + 1}</span>
                </div>
                {/* Finding */}
                <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--tool-info-bg)", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", color: "var(--ink)", flexShrink: 0, maxWidth: "100%" }}>
                    <i className="ti ti-chart-bar" aria-hidden="true" style={{ fontSize: 17 }} />
                    {h.finding}
                  </div>
                </div>
                {/* Hypothesis text */}
                <div style={{ padding: "10px 16px 14px" }}>
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "var(--ink)", lineHeight: 1.7, margin: 0 }}>{h.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AnalysisStep({ included, onReset }) {
  const a = runAnalysis(included);
  const [showHypotheses, setShowHypotheses] = useState(false);
  if (!a) return <div style={{ padding: 24, color: "var(--tool-text-secondary)" }}>No records to analyze.</div>;

  // ── Minimum record threshold ──
  if (included.length < 20) {
    return (
      <div>
        <div style={{ padding: "20px 24px", background: "var(--tool-danger-bg)", border: "1px solid var(--tool-danger-border)", borderRadius: "var(--radius-sm)", fontSize: 16, color: "var(--tool-danger-fg)", lineHeight: 1.6 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <i className="ti ti-alert-circle" aria-hidden="true" style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }} />
            <span>Your dataset contains fewer than 20 records after filtering. This is insufficient for reliable win/loss analysis. Expand your date range or review your filter criteria before running the analysis.</span>
          </div>
        </div>
        <button onClick={onReset} style={{ fontSize: 17, marginTop: 16 }}>
          <i className="ti ti-arrow-left" aria-hidden="true" style={{ marginRight: 6 }} />
          Start over
        </button>
      </div>
    );
  }

  const fmtRate = (r) => `${Math.round(r * 100)}%`;
  const lowVolumeWarning = included.length < 50;

  return (
    <div>
      {/* Low volume warning banner */}
      {lowVolumeWarning && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", background: "var(--tool-warning-bg)", border: "1px solid var(--gold)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em", color: "var(--tool-warning-fg)", marginBottom: 20 }}>
          <i className="ti ti-alert-triangle" aria-hidden="true" style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }} />
          <span>Your dataset contains {included.length} records. Be aware that results below 50 records may not be statistically reliable.</span>
        </div>
      )}

      {/* Summary header */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatChip label="Records analyzed" value={a.n.toLocaleString()} />
        <StatChip label="Overall win rate" value={fmtRate(a.overallWinRate)} accent={a.overallWinRate >= 0.5} sub={`${a.wins}W · ${a.losses}L`} />
        <StatChip label="Win candidates" value={a.winCandidates} sub="30–180 day window" />
        <StatChip label="Loss candidates" value={a.lossCandidates} sub="30–180 day window" />
      </div>

      {/* ── Block 1: Coverage Diagnostics ── */}
      <AnalysisBlock title="Coverage diagnostics" icon="ti-checklist">
        <div>
          <CoverageMeter label="Missing primary competitor" count={a.missingCompetitor} total={a.n} />
          <CoverageMeter label="Missing close reason" count={a.missingCloseReason} total={a.n} />
          <CoverageMeter label="Missing contact email" count={a.missingEmail} total={a.n} />
          <div style={{ borderBottom: "none" }}>
            <CoverageMeter label="Generic / catch-all close reason" count={a.genericReasonCount} total={a.n} />
          </div>
        </div>


      </AnalysisBlock>

      {/* ── Block 2: Win Rate Analysis ── */}
      <AnalysisBlock title="Win rate analysis" icon="ti-chart-bar">
        {/* Overall win rate bar */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--tool-border-tertiary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18, color: "var(--tool-text-secondary)", minWidth: 80 }}>Overall</span>
            <div style={{ flex: 1, height: 10, background: "var(--paper-2)", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${Math.round(a.overallWinRate * 100)}%`, height: "100%", background: "var(--tool-success-border)", borderRadius: 5 }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 500, color: "var(--tool-success-fg)", minWidth: 44, textAlign: "right" }}>{fmtRate(a.overallWinRate)}</span>
            <span style={{ fontSize: 17, color: "var(--muted)" }}>{a.wins}W / {a.losses}L</span>
          </div>
        </div>

        <DimensionSection title="By vertical" rows={a.byVertical} overallRate={a.overallWinRate} />
        <DimensionSection title="By geo" rows={a.byGeo} overallRate={a.overallWinRate} />
        <DimensionSection title="By segment" rows={a.bySegment} overallRate={a.overallWinRate} />
        <DimensionSection title="By rep" rows={a.byRep} overallRate={a.overallWinRate} />
        <DimensionSection title="By primary competitor" rows={a.byCompetitor} overallRate={a.overallWinRate} />
      </AnalysisBlock>

      {/* ── Block 3: Win Attribution ── */}
      <AnalysisBlock title="Win attribution" icon="ti-trophy" defaultOpen={true}>
        {a.wins === 0 ? (
          <div style={{ padding: "16px", fontSize: 18, color: "var(--muted)", fontStyle: "italic" }}>No wins in filtered dataset.</div>
        ) : (
          <>
            <div>
              {a.winReasons.slice(0, 15).map((r, i) => {
                return <ReasonRow key={r.reason} {...r} total={a.wins} isLast={i === Math.min(a.winReasons.length, 15) - 1} />;
              })}
              {a.winReasons.length > 15 && (
                <div style={{ padding: "9px 16px", fontSize: 17, color: "var(--muted)", borderTop: "1px solid var(--tool-border-tertiary)" }}>
                  +{a.winReasons.length - 15} more reason groups
                </div>
              )}
            </div>

          </>
        )}
      </AnalysisBlock>

      {/* ── Block 4: Loss Attribution ── */}
      <AnalysisBlock title="Loss attribution" icon="ti-alert-circle" defaultOpen={true}>
        {a.losses === 0 ? (
          <div style={{ padding: "16px", fontSize: 18, color: "var(--muted)", fontStyle: "italic" }}>No losses in filtered dataset.</div>
        ) : (
          <>
            <div>
              {a.lossReasons.slice(0, 15).map((r, i) => {
                return <ReasonRow key={r.reason} {...r} total={a.losses} isLast={i === Math.min(a.lossReasons.length, 15) - 1} />;
              })}
              {a.lossReasons.length > 15 && (
                <div style={{ padding: "9px 16px", fontSize: 17, color: "var(--muted)", borderTop: "1px solid var(--tool-border-tertiary)" }}>
                  +{a.lossReasons.length - 15} more reason groups
                </div>
              )}
            </div>

          </>
        )}
      </AnalysisBlock>

      {/* ── Block 5: Interview Candidate Summary ── */}
      <AnalysisBlock title="Interview candidate summary" icon="ti-users" defaultOpen={true}>
        <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Win candidates */}
          <div style={{ background: "var(--paper-2)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Tag color="success">Wins</Tag>
              <span style={{ fontSize: 17, color: "var(--muted)" }}>30–180 days, email present</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>
              {a.winCandidates}
            </div>
            <div style={{ fontSize: 18, color: "var(--tool-text-secondary)" }}>
              candidates
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--tool-border-tertiary)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Likely participants</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "var(--tool-success-fg)" }}>
                {a.targetWinInterviews}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                12% of {a.winCandidates} candidates, rounded up
              </div>
            </div>
          </div>

          {/* Loss candidates */}
          <div style={{ background: "var(--paper-2)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Tag color="danger">Losses</Tag>
              <span style={{ fontSize: 17, color: "var(--muted)" }}>30–180 days, email present</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>
              {a.lossCandidates}
            </div>
            <div style={{ fontSize: 18, color: "var(--tool-text-secondary)" }}>
              candidates
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--tool-border-tertiary)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>Likely participants</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: "var(--tool-danger-fg)" }}>
                {a.targetLossInterviews}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                6% of {a.lossCandidates} candidates, rounded up
              </div>
            </div>
          </div>
        </div>

      </AnalysisBlock>

      {/* ── Hypothesis generation ── */}
      {!showHypotheses ? (
        <div style={{ marginTop: 4, marginBottom: 8 }}>
          <button
            onClick={() => setShowHypotheses(true)}
            style={{ background: "var(--gold)", color: "var(--ink)", border: "1px solid var(--gold)", cursor: "pointer", padding: "10px 20px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}
          >
            <i className="ti ti-bulb" aria-hidden="true" style={{ marginRight: 7 }} />
            Generate hypotheses
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 8 }}>
          <HypothesisBlock hypotheses={generateHypotheses(included, a)} />
        </div>
      )}

      <button onClick={onReset} style={{ fontSize: 17, marginTop: 8 }}>
        <i className="ti ti-arrow-left" aria-hidden="true" style={{ marginRight: 6 }} />
        Start over
      </button>
    </div>
  );
}

export default AnalysisStep;
