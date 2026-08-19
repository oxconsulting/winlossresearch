/**
 * src/lib/win-loss-tool/dataProcessing.js
 *
 * Date parsing, outcome normalization, deal value parsing, and the
 * filter/normalize pass. Ported verbatim from crm_diagnostic_tool-v1.jsx
 * (Date parsing + Outcome normalization + Deal value parsing +
 * Filter & normalize sections) — no logic changes.
 */

// Minimum record count for statistically meaningful win/loss analysis.
// Single source of truth: referenced by the raw-upload row-count check in
// UploadStep, the panel copy in UploadStep, and the post-filter record-count
// gate in AnalysisStep.
const MIN_RECORDS_REQUIRED = 20;

// ─── Date parsing ─────────────────────────────────────────────────────────────

function detectDateFormat(values) {
  const isoRe = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
  const slashDateRe = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
  const nonEmpty = values.filter(v => v);

  const isoMatches = nonEmpty.filter(v => isoRe.test(v.trim()));
  if (isoMatches.length > nonEmpty.length * 0.5) {
    return { format: "YYYY-MM-DD", parser: (v) => {
      if (!v) return null;
      const m = v.trim().match(isoRe);
      if (!m) return null;
      const d = new Date(+m[1], +m[2] - 1, +m[3]);
      return isNaN(d) ? null : d;
    }};
  }

  let firstGt12 = false, secondGt12 = false;
  for (const v of nonEmpty) {
    const m = v.trim().match(slashDateRe);
    if (m) { if (+m[1] > 12) firstGt12 = true; if (+m[2] > 12) secondGt12 = true; }
  }

  let chosenFormat = firstGt12 && !secondGt12 ? "DD/MM/YYYY"
    : secondGt12 ? "MM/DD/YYYY" : "MM/DD/YYYY_ambiguous";
  const isDD = chosenFormat === "DD/MM/YYYY";

  const slashParser = (v) => {
    if (!v) return null;
    const m = v.trim().match(slashDateRe);
    if (!m) return null;
    const yr = +m[3], a = +m[1], b = +m[2];
    const d = isDD ? new Date(yr, b - 1, a) : new Date(yr, a - 1, b);
    return isNaN(d) ? null : d;
  };

  if (nonEmpty.some(v => slashDateRe.test(v.trim()))) {
    return { format: chosenFormat, parser: slashParser };
  }

  return { format: "auto", parser: (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }};
}

// ─── Outcome normalization ────────────────────────────────────────────────────

// Token matching (not raw substring/anchor matching) so real-world stage
// values like "Stage 9 - Closed Lost" are recognized: punctuation is
// stripped, then \b-bounded tokens are checked so "winter" doesn't
// false-positive on "win". A value matching both or neither is left
// unrecognized (null) rather than guessed — see normalizeOutcome's caller,
// which already surfaces null outcomes in the exclusion/data-quality report.
const WIN_TOKENS_RE  = /\b(won|win|closed won)\b/;
const LOSS_TOKENS_RE = /\b(lost|loss|closed lost)\b/;

function normalizeOutcome(raw) {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase().replace(/[_\-]/g, " ").replace(/\s+/g, " ").trim();
  const isWin = WIN_TOKENS_RE.test(cleaned);
  const isLoss = LOSS_TOKENS_RE.test(cleaned);
  if (isWin && !isLoss) return "Win";
  if (isLoss && !isWin) return "Loss";
  return null;
}

// ─── Deal value parsing ───────────────────────────────────────────────────────

function parseDealValue(raw) {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[$£€,\s]/g, "").trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}
// ─── Filter & normalize ───────────────────────────────────────────────────────

function filterAndNormalize(rows, mapping, windowDays) {
  const get = (row, key) => { const col = mapping[key]; return col ? (row[col] || "") : ""; };
  const allDateVals = rows.map(r => get(r, "close_date")).filter(Boolean);
  const { format: detectedFormat, parser: parseDate } = detectDateFormat(allDateVals);

  const cutoff = new Date(); cutoff.setHours(0, 0, 0, 0);
  const windowStart = new Date(cutoff); windowStart.setDate(windowStart.getDate() - windowDays);

  const included = [], excluded = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]; const reasons = [];
    const rawDate = get(row, "close_date");
    const parsedDate = parseDate(rawDate);
    if (!parsedDate) { reasons.push("Date unparseable"); }
    else if (parsedDate > cutoff) { reasons.push("Close date is in the future"); }
    else if (parsedDate < windowStart) {
      reasons.push(`Close date outside ${windowDays}-day window (${Math.round((cutoff - parsedDate) / 86400000)} days ago)`);
    }
    const rawOutcome = get(row, "outcome");
    const normOutcome = normalizeOutcome(rawOutcome);
    if (!normOutcome) reasons.push(rawOutcome ? `Outcome "${rawOutcome}" not recognized as Win or Loss` : "Outcome is blank");
    const email = get(row, "primary_contact_email").trim();
    const rawVal = get(row, "deal_value");
    const dealVal = parseDealValue(rawVal);
    if (dealVal === null) { reasons.push("Deal value blank or unparseable"); }
    else if (dealVal <= 0) { reasons.push(`Deal value is $0 or negative (${rawVal})`); }

    const normalized = {
      _rowIndex: i, _rawOutcome: rawOutcome, _parsedDate: parsedDate,
      outcome: normOutcome, close_date: parsedDate, deal_value: dealVal,
      company: get(row, "company_name") || get(row, "primary_contact_name") || `Row ${i + 1}`,
      rep: get(row, "rep_name"), email,
      close_reason: get(row, "close_reason"),
      competitor: get(row, "primary_competitor"),
      vertical: get(row, "vertical"), geo: get(row, "geo"), segment: get(row, "segment"),
    };

    if (reasons.length === 0) included.push(normalized);
    else excluded.push({ ...normalized, reasons });
  }
  return { included, excluded, detectedFormat };
}

export { MIN_RECORDS_REQUIRED, detectDateFormat, normalizeOutcome, parseDealValue, filterAndNormalize };
