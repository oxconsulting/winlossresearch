/**
 * src/lib/win-loss-tool/hypothesisEngine.js
 *
 * Rule-based interview hypothesis generation (LOSS_BUCKETS / WIN_BUCKETS
 * system). Ported verbatim from crm_diagnostic_tool-v1.jsx (Hypothesis
 * engine section) — no logic changes. Per project instructions, this is
 * deliberately decoupled from the analysis display layer and does not
 * include WIN_EXECUTION_PATTERNS/LOSS_ALIBI_PATTERNS from the stale spec.
 */

// ─── Hypothesis engine ────────────────────────────────────────────────────────

// Loss reason buckets for hypothesis grouping
const LOSS_BUCKETS = {
  pricing:     ["pricing","price","too expensive","budget","cost","costly","expensive","packaging","pricing structure"],
  inconclusive:["unknown","unresponsive","no response","inconclusive","no decision","none","n/a","i don't know","no reason","not provided","unclear","miscellaneous","other","status quo","stalled","lost champion","politics","internal decision","champion"],
  competitor:  ["competitor","competitive","competition","lost to","chose","alternative","incumbent","stayed with","better alternative"],
  product_gap: ["product","feature","functionality","gap","roadmap","missing","capability","requirement","use case","technical","integration","complexity","usability","implementation","limitation"],
};

// Win reason buckets
const WIN_BUCKETS = {
  execution: ["execution","sales execution","company execution","relationship","champion","internal support","our team","sales team","great sales","rep performance","account executive","ae performance","salesperson","account exec","trusted advisor","executive buy-in","strong champion"],
};

function bucketReason(reason, buckets) {
  if (!reason) return null;
  const n = reason.toLowerCase().trim();
  for (const [bucket, keywords] of Object.entries(buckets)) {
    if (keywords.some(kw => n.includes(kw) || kw.includes(n))) return bucket;
  }
  return null;
}

function computeBucketPcts(records, buckets) {
  const counts = {};
  for (const r of records) {
    const b = bucketReason(r.close_reason, buckets);
    if (b) counts[b] = (counts[b] || 0) + 1;
  }
  const total = records.length;
  return Object.fromEntries(
    Object.keys(buckets).map(b => [b, { count: counts[b] || 0, pct: total ? (counts[b] || 0) / total : 0 }])
  );
}

const LOSS_BUCKET_HYPOTHESES = {
  inconclusive: {
    label: "Inconclusive / No Reason",
    text: "A significant share of your losses have no actionable reason code. This is likely a combination of rep behavior, process gaps, and loss coding discipline — but no signal is a signal. These deals are high priority interview targets because the absence of a reason is itself a finding worth understanding.",
  },
  pricing: {
    label: "Pricing / Budget",
    text: "Pricing is the most common alibi in B2B SaaS loss data. It rarely means what it says — it masks competitive dynamics, perception gaps, change management problems, and transparency concerns. Do not adjust pricing until interviews tell you what pricing actually meant in these deals.",
  },
  competitor: {
    label: "Competitor",
    text: "Competitor is not a reason code — it is an outcome. Buyers choose competitors for reasons your CRM is not capturing. These losses contain the most actionable competitive intelligence in your dataset and should be prioritized in interview targeting.",
  },
  product_gap: {
    label: "Product Gap",
    text: "Product Gap losses split into two very different problems: actual capability gaps and perception gaps. A real feature gap requires a roadmap conversation. A perception gap requires a messaging fix. Interviews are the only way to tell which problem you actually have — and the fix for each is completely different.",
  },
};

const WIN_BUCKET_HYPOTHESES = {
  execution: {
    label: "Execution / Sales Performance",
    text: "Execution is the most common win reason code and also the least actionable. Great sales does win deals — but this reason masks the specific dynamics that actually drove the buyer's decision. These are high value interview targets because understanding what execution meant to the buyer is what makes it repeatable.",
  },
};

const DIMENSION_LABELS = { vertical: "Vertical", geo: "Geo", segment: "Segment" };
const THRESHOLD = 0.25;
const SEGMENT_VOLUME_THRESHOLD = 0.15;

function generateHypotheses(included, a) {
  const hypotheses = [];
  const losses = included.filter(r => r.outcome === "Loss");
  const wins   = included.filter(r => r.outcome === "Win");

  // ── 1. Segment performance hypotheses (top offender per dimension) ──
  for (const [dimKey, dimLabel] of Object.entries(DIMENSION_LABELS)) {
    const rows = a[`by${dimLabel}`] || [];
    // Find the single worst offender: >15% volume share AND below avg win rate
    let worst = null;
    for (const row of rows) {
      const volShare = a.n ? row.total / a.n : 0;
      if (volShare > SEGMENT_VOLUME_THRESHOLD && row.rate < a.overallWinRate) {
        const signal = (a.overallWinRate - row.rate) * volShare; // weight by volume
        if (!worst || signal > worst.signal) {
          worst = { ...row, volShare, signal, dimKey, dimLabel };
        }
      }
    }
    if (worst) {
      const rateDelta = a.overallWinRate - worst.rate;
      hypotheses.push({
        type: "segment",
        signal: worst.signal,
        finding: `${worst.dim} (${dimLabel}) — ${Math.round(worst.volShare * 100)}% of pipeline, ${Math.round(worst.rate * 100)}% win rate vs. ${Math.round(a.overallWinRate * 100)}% average`,
        text: `Your ${worst.dim} ${dimLabel.toLowerCase()} represents significant pipeline volume but is underperforming your average win rate. Prioritize interviews in this segment to understand whether this is a structural pipeline problem or a fixable execution gap — the difference determines whether you fix your motion or your targeting.`,
      });
    }
  }

  // ── 2. Loss reason bucket hypotheses ──
  if (losses.length > 0) {
    const bucketPcts = computeBucketPcts(losses, LOSS_BUCKETS);
    for (const [bucket, { pct, count }] of Object.entries(bucketPcts)) {
      if (pct > THRESHOLD) {
        const hyp = LOSS_BUCKET_HYPOTHESES[bucket];
        if (hyp) {
          hypotheses.push({
            type: "loss_reason",
            signal: pct - THRESHOLD,
            finding: `${hyp.label} accounts for ${Math.round(pct * 100)}% of losses (${count} of ${losses.length})`,
            text: hyp.text,
          });
        }
      }
    }
  }

  // ── 3. Win reason bucket hypotheses ──
  if (wins.length > 0) {
    const bucketPcts = computeBucketPcts(wins, WIN_BUCKETS);
    for (const [bucket, { pct, count }] of Object.entries(bucketPcts)) {
      if (pct > THRESHOLD) {
        const hyp = WIN_BUCKET_HYPOTHESES[bucket];
        if (hyp) {
          hypotheses.push({
            type: "win_reason",
            signal: pct - THRESHOLD,
            finding: `${hyp.label} accounts for ${Math.round(pct * 100)}% of wins (${count} of ${wins.length})`,
            text: hyp.text,
          });
        }
      }
    }
  }

  // Sort by signal strength descending
  hypotheses.sort((a, b) => b.signal - a.signal);
  return hypotheses;
}

export {
  LOSS_BUCKETS, WIN_BUCKETS, bucketReason, computeBucketPcts,
  LOSS_BUCKET_HYPOTHESES, WIN_BUCKET_HYPOTHESES,
  DIMENSION_LABELS, THRESHOLD, SEGMENT_VOLUME_THRESHOLD,
  generateHypotheses,
};
