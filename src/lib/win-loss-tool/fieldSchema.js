/**
 * src/lib/win-loss-tool/fieldSchema.js
 *
 * Standard field schema and fuzzy-mapping logic for the CRM diagnostic tool.
 * Ported verbatim from crm_diagnostic_tool-v1.jsx (Schema + Auto-mapping
 * sections) — no logic changes. Source of truth over CRM_Diagnostic_Tool_Spec.md
 * for required fields and mapping mechanics (see project instructions).
 */

// ─── Schema ───────────────────────────────────────────────────────────────────

const STANDARD_FIELDS = [
  { key: "deal_id",               label: "Deal ID",               description: "Unique deal identifier",           required: false },
  { key: "close_date",            label: "Close Date",            description: "Date deal was closed won or lost", required: true,  shortLabel: "Close Date"  },
  { key: "outcome",               label: "Deal Outcome",          description: "Win or Loss",                      required: true,  shortLabel: "Outcome"     },
  { key: "close_reason",          label: "Closed Reason",         description: "Rep-entered close/loss reason",    required: true,  shortLabel: "Reason"      },
  { key: "deal_value",            label: "Deal Value",            description: "ACV or deal size",                 required: true,  shortLabel: "Value"       },
  { key: "rep_name",              label: "Rep Name",              description: "Owning sales rep",                 required: false },
  { key: "primary_competitor",    label: "Primary Competitor",    description: "Competitor credited in CRM",       required: true,  shortLabel: "Competitor"  },
  { key: "vertical",              label: "Industry/Vertical",     description: "Industry or vertical",             required: false },
  { key: "geo",                   label: "Geo",                   description: "Geography or region",              required: false },
  { key: "segment",               label: "Segment",               description: "Company size segment or product",  required: false },
  { key: "primary_contact_name",  label: "Primary Contact Name",  description: "Main buyer contact name",          required: false },
  { key: "primary_contact_title", label: "Primary Contact Title", description: "Main buyer contact title",         required: false },
  { key: "primary_contact_email", label: "Primary Contact Email", description: "Main buyer contact email",         required: true,  shortLabel: "Email"       },
  { key: "company_name",          label: "Company Name",          description: "Prospect/customer company",        required: false },
  { key: "company_size",          label: "Company Size",          description: "Employee count or revenue band",   required: false },
  { key: "sales_cycle_days",      label: "Sales Cycle Days",      description: "Days from open to close",          required: false },
  { key: "deal_source",           label: "Deal Source",           description: "Lead source",                      required: false },
  { key: "stage_at_loss",         label: "Stage At Loss",         description: "Last stage reached before loss",   required: false },
];

// ─── Auto-mapping ─────────────────────────────────────────────────────────────

const FIELD_ALIASES = {
  close_date:           ["close date","closed date","close_dt","closed_dt","date closed","closedate","close date won/lost"],
  outcome:              ["won/lost","win loss","win/loss","deal outcome","result","disposition","closed status","status","stage","close stage"],
  close_reason:         ["loss reason","lost reason","close reason","won reason","reason","close notes","loss notes","reason lost","reason won","close type"],
  deal_value:           ["amount","acv","arr","deal size","value","revenue","contract value","deal amount","opportunity amount","total value"],
  rep_name:             ["owner","sales rep","account exec","ae","account executive","rep","sales owner","assigned to","account owner"],
  primary_competitor:   ["competitor","competition","competing vendor","lost to","won against","primary competitor","main competitor"],
  vertical:             ["industry","vertical","sector","market","business type","company type"],
  geo:                  ["region","geography","territory","location","area","country"],
  segment:              ["segment","company segment","market segment","product line","tier","size tier","size band","customer segment"],
  primary_contact_name: ["contact name","buyer name","contact","primary contact","main contact","decision maker","champion"],
  primary_contact_title:["contact title","buyer title","title","job title","role","contact role"],
  primary_contact_email:["contact email","buyer email","email","primary email","contact e-mail"],
  company_name:         ["company","account","account name","customer","prospect","organization","org"],
  company_size:         ["employees","headcount","company size","employee count","size","employee range"],
  sales_cycle_days:     ["days to close","cycle length","sales cycle","time to close","days open","cycle days"],
  deal_source:          ["source","lead source","origin","channel","deal channel","inbound/outbound"],
  stage_at_loss:        ["stage","last stage","pipeline stage","stage lost","lost stage","stage at close"],
  deal_id:              ["id","deal id","opportunity id","opp id","deal number","record id"],
};

function normalize(str) {
  return str.toLowerCase().replace(/[_\-\.]/g, " ").replace(/\s+/g, " ").trim();
}

// Keyword-contains rules: header *contains* this token → auto-map to that field.
// Score 66 clears the >=65 auto-apply bar but is beaten by alias/token matches (90, 75, 65).
const CONTAINS_RULES = {
  outcome:  ["stage", "disposition"],
  vertical: ["industry", "vertical"],
  geo:      ["country", "territory"],
};

function scoreMatch(clientHeader, standardKey) {
  const norm = normalize(clientHeader);
  const keyNorm = normalize(standardKey);
  const aliases = FIELD_ALIASES[standardKey] || [];
  if (norm === keyNorm) return 100;
  if (aliases.some(a => normalize(a) === norm)) return 90;
  const normTokens = new Set(norm.split(" "));
  const keyTokens = keyNorm.split(" ");
  if (keyTokens.length > 1 && keyTokens.every(t => normTokens.has(t))) return 75;
  for (const alias of aliases) {
    const aTokens = normalize(alias).split(" ");
    const overlap = aTokens.filter(t => normTokens.has(t)).length;
    const ratio = overlap / Math.max(aTokens.length, norm.split(" ").length);
    if (ratio >= 0.85) return 65;
  }
  // Keyword-contains tier: lower priority than all alias/token matches
  const keywords = CONTAINS_RULES[standardKey] || [];
  if (keywords.some(kw => norm.includes(kw))) return 66;
  return 0;
}

function autoMap(clientHeaders) {
  const mapping = {};
  const used = new Set();
  for (const field of STANDARD_FIELDS) {
    let best = 0, bestH = "";
    for (const h of clientHeaders) {
      if (used.has(h)) continue;
      const s = scoreMatch(h, field.key);
      if (s > best) { best = s; bestH = h; }
    }
    if (best >= 65) { mapping[field.key] = bestH; used.add(bestH); }
    else mapping[field.key] = "";
  }
  return mapping;
}

export { STANDARD_FIELDS, FIELD_ALIASES, CONTAINS_RULES, normalize, scoreMatch, autoMap };
