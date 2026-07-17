/**
 * src/lib/win-loss-tool/analysisEngine.js
 *
 * Coverage diagnostics, win-rate breakdowns, loss/win attribution, and
 * interview candidate sizing. Ported verbatim from crm_diagnostic_tool-v1.jsx
 * (Analysis engine section) — no logic changes.
 */

// ─── Analysis engine ──────────────────────────────────────────────────────────

// Catch-all close reasons (coverage diagnostic)
const GENERIC_REASONS = [
  "no decision","pricing","budget","pricing/budget","lost - other",
  "unknown","other","no response","lost-other","n/a","none",
];
function isGenericReason(r) {
  if (!r) return false;
  const n = r.toLowerCase().trim();
  return GENERIC_REASONS.some(g => n === g || n.includes(g));
}

function winRateByDimension(records, key) {
  const groups = {};
  for (const r of records) {
    const val = (r[key] || "").trim() || "(blank)";
    if (!groups[val]) groups[val] = { wins: 0, total: 0 };
    groups[val].total++;
    if (r.outcome === "Win") groups[val].wins++;
  }
  return Object.entries(groups)
    .map(([dim, { wins, total }]) => ({ dim, wins, total, rate: total ? wins / total : 0 }))
    .sort((a, b) => b.total - a.total);
}

function reasonDistribution(records) {
  const counts = {};
  for (const r of records) {
    const key = (r.close_reason || "").trim() || "(blank)";
    counts[key] = (counts[key] || 0) + 1;
  }
  const total = records.length;
  return Object.entries(counts)
    .map(([reason, count]) => ({ reason, count, pct: total ? count / total : 0 }))
    .sort((a, b) => b.count - a.count);
}

function runAnalysis(included) {
  const n = included.length;
  if (n === 0) return null;

  const wins  = included.filter(r => r.outcome === "Win");
  const losses = included.filter(r => r.outcome === "Loss");

  // ── 1. Coverage diagnostics ──
  const missingCompetitor = included.filter(r => !r.competitor.trim()).length;
  const missingCloseReason = included.filter(r => !r.close_reason.trim()).length;
  const missingEmail = included.filter(r => !r.email.trim()).length;
  const genericReasonCount = included.filter(r => isGenericReason(r.close_reason)).length;

  // ── 2. Win rate analysis ──
  const overallWinRate = n ? wins.length / n : 0;
  const byVertical   = winRateByDimension(included, "vertical");
  const byGeo        = winRateByDimension(included, "geo");
  const bySegment    = winRateByDimension(included, "segment");
  const byRep        = winRateByDimension(included, "rep");
  const byCompetitor = winRateByDimension(included, "competitor");

  // Rep win rate variance
  const repRates = byRep.filter(r => r.total >= 3).map(r => r.rate);
  const repVariance = repRates.length >= 2
    ? Math.max(...repRates) - Math.min(...repRates) : 0;

  // ── 3. Win attribution ──
  const winReasons = reasonDistribution(wins);

  // ── 4. Loss attribution ──
  const lossReasons = reasonDistribution(losses);
  const topLossReason = lossReasons[0] || null;
  const concentrationFlag = topLossReason && topLossReason.pct > 0.4;
  const missingCompetitorOnLosses = losses.filter(r => !r.competitor.trim()).length;
  const missingCompetitorLossPct = losses.length ? missingCompetitorOnLosses / losses.length : 0;

  // ── 5. Interview candidates ──
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysAgo = (d, n) => { const t = new Date(d); t.setDate(t.getDate() - n); return t; };
  const minDate = daysAgo(today, 180);
  const maxDate = daysAgo(today, 30);

  const winCandidates = wins.filter(r =>
    r.email && r.close_date >= minDate && r.close_date <= maxDate
  );
  const lossCandidates = losses.filter(r =>
    r.email && r.close_date >= minDate && r.close_date <= maxDate
  );

  const targetWinInterviews  = Math.ceil(winCandidates.length * 0.12);
  const targetLossInterviews = Math.ceil(lossCandidates.length * 0.06);

  return {
    n, wins: wins.length, losses: losses.length, overallWinRate,
    // Coverage
    missingCompetitor, missingCloseReason, missingEmail, genericReasonCount,
    missingCompetitorLossPct,
    // Win rate breakdowns
    byVertical, byGeo, bySegment, byRep, byCompetitor, repVariance,
    // Win attribution
    winReasons,
    // Loss attribution
    lossReasons, concentrationFlag, topLossReason,
    // Interview candidates
    winCandidates: winCandidates.length, lossCandidates: lossCandidates.length,
    targetWinInterviews, targetLossInterviews,
  };
}

export { GENERIC_REASONS, isGenericReason, winRateByDimension, reasonDistribution, runAnalysis };
