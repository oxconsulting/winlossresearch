/**
 * src/components/win-loss-tool/WinLossAnalyzer.jsx
 *
 * Top-level component (formerly `App` in crm_diagnostic_tool-v1.jsx).
 * Owns step state and renders the step indicator + active step.
 *
 * Two deliberate changes from the source, both required by the Astro
 * integration rather than being logic changes:
 *
 * 1. The H1 and intro paragraph that used to live inside `App`'s render
 *    are REMOVED here. They now live in the .astro page shell instead,
 *    rendered statically (server-side) above this client:only island.
 *    Reason: seoGraph()'s validateH1 build check requires exactly one H1
 *    per page. Since this component only mounts client-side, an H1 inside
 *    it would be invisible to the initial crawl anyway — for an
 *    AEO-citable page, the H1 and direct-answer paragraph need to be in
 *    the static HTML, not inside the client:only bundle.
 * 2. Wrapped in an ErrorBoundary (ported from the artifact's standalone
 *    HTML version, which had one at the ReactDOM.render() call site —
 *    the JSX artifact itself didn't, since it never had its own render
 *    root). Worth keeping for a data-processing tool that ingests
 *    arbitrary user CSVs.
 * 3. The wrapper no longer caps its own width at 900px. The .astro page
 *    now opts into a wider <main> (`wide` prop, see BaseLayout.astro /
 *    global.css `.main--wide`), so this component just fills whatever
 *    width main provides instead of applying a second, competing cap.
 * 4. A useEffect toggles the visibility of the static #tool-answer
 *    paragraph (rendered in the .astro page, not by this component) once
 *    the person moves past the Upload step — see the effect itself for
 *    why that paragraph lives outside this component's own DOM tree.
 *
 * The outer wrapper carries the `win-loss-tool` class, which scopes all
 * tool-specific tokens and base element styles (button/select resets,
 * danger/warning/success accent colors) defined in global.css — see that
 * file's "Win/Loss Analysis Tool" section. Nothing in this component
 * relies on global (unscoped) selectors.
 */
import { useState, useEffect, Component } from 'react';
import UploadStep from './UploadStep';
import MappingStep from './MappingStep';
import FilterStep from './FilterStep';
import AnalysisStep from './AnalysisStep';

const STEPS = { UPLOAD: 'upload', MAPPING: 'mapping', FILTER: 'filter', ANALYSIS: 'analysis' };

// One-line instruction shown below the step indicator, specific to whatever
// step is active. Centralized here (rather than duplicated inside each of
// the four step components) since WinLossAnalyzer already tracks `step`.
const STEP_INSTRUCTIONS = {
  [STEPS.MAPPING]: 'Match each CRM column to a field below — a preview of your data appears as you map.',
  [STEPS.FILTER]: 'Choose a date window. Opportunities closed outside this range are excluded from analysis.',
  [STEPS.ANALYSIS]: 'Review the win/loss breakdown, then generate hypotheses to prioritize interview targets.',
};

function WinLossAnalyzer() {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [fileData, setFileData] = useState(null);
  const [confirmedMapping, setConfirmedMapping] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  function handleParsed(data) { setFileData(data); setStep(STEPS.MAPPING); window.scrollTo(0, 0); }
  function handleConfirm(mapping) { setConfirmedMapping(mapping); setStep(STEPS.FILTER); window.scrollTo(0, 0); }
  function handleAnalyze(included) { setFilteredData(included); setStep(STEPS.ANALYSIS); window.scrollTo(0, 0); }
  function handleReset() { setFileData(null); setConfirmedMapping(null); setFilteredData(null); setStep(STEPS.UPLOAD); window.scrollTo(0, 0); }

  const stepLabels = ["Upload", "Map fields", "Filter & review", "Analysis"];
  const currentIdx = { [STEPS.UPLOAD]: 0, [STEPS.MAPPING]: 1, [STEPS.FILTER]: 2, [STEPS.ANALYSIS]: 3 }[step];

  // Collapse the static direct-answer paragraph (#tool-answer, rendered
  // server-side in free-win-loss-analysis-tool.astro) once the person
  // moves past Upload — reclaims vertical space for the mapping/filter/
  // analysis screens, which need more of it than the upload screen does.
  // The paragraph itself is untouched in the HTML source; this only
  // changes what's visible after the island hydrates.
  useEffect(() => {
    const answerEl = document.getElementById('tool-answer');
    if (!answerEl) return;
    answerEl.style.display = step === STEPS.UPLOAD ? '' : 'none';
  }, [step]);

  return (
    <div className="win-loss-tool" style={{ padding: "2rem 0" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: "8px 0" }}>
        {stepLabels.map((label, i) => {
          const done = i < currentIdx; const active = i === currentIdx;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, background: done ? "var(--gold)" : active ? "var(--ink)" : "var(--paper-2)", color: done ? "var(--ink)" : active ? "var(--paper)" : "var(--muted)", border: `1px solid ${done ? "var(--gold)" : active ? "var(--ink)" : "var(--tool-border-secondary)"}` }}>
                  {done ? <i className="ti ti-check" style={{ fontSize: 17 }} /> : i + 1}
                </div>
                <span style={{ fontSize: 18, fontWeight: active ? 500 : 400, color: active ? "var(--ink)" : "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 17, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && <div style={{ width: 28, height: 1, background: "var(--tool-border-secondary)", margin: "0 8px" }} />}
            </div>
          );
        })}
      </div>
      {step !== STEPS.UPLOAD && <p className="step-instruction">{STEP_INSTRUCTIONS[step]}</p>}
      {step === STEPS.UPLOAD   && <UploadStep onParsed={handleParsed} />}
      {step === STEPS.MAPPING  && fileData && <MappingStep filename={fileData.filename} headers={fileData.headers} rows={fileData.rows} onConfirm={handleConfirm} onReset={handleReset} />}
      {step === STEPS.FILTER   && fileData && confirmedMapping && <FilterStep filename={fileData.filename} mapping={confirmedMapping} rows={fileData.rows} onAnalyze={handleAnalyze} onReset={handleReset} />}
      {step === STEPS.ANALYSIS && filteredData && <AnalysisStep included={filteredData} onReset={handleReset} />}
    </div>
  );
}

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="win-loss-tool" style={{ padding: 32, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--tool-danger-fg)", background: "var(--tool-danger-bg)", border: "1px solid var(--tool-danger-border)", borderRadius: "var(--radius-sm)", margin: 24 }}>
          <strong>Something went wrong processing this file.</strong>
          <br /><br />
          {String(this.state.error.message)}
          <br /><br />
          <button onClick={() => this.setState({ error: null })} style={{ fontSize: 13 }}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function WinLossAnalyzerWithBoundary() {
  return (
    <ErrorBoundary>
      <WinLossAnalyzer />
    </ErrorBoundary>
  );
}
