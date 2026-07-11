---
title: "How to Build a Win/Loss Interview Target List"
description: "Pull the target list from the CRM directly, sized well above the interview target to account for low participation."
phase: "recruit-outreach"
phaseOrder: 1
relatedPillars: ["why-internal-win-loss-data-fails", "win-loss-research-methodology"]
realityCheck: true
realityCheckText: "A CRM-sourced list removes formal deal-by-deal approval, but reps can still exercise informal control over who ends up reachable: an outdated title, a missing email, or a stale phone number on the buyer who left the angriest voicemail. A criteria-based pull is only as unbiased as the contact data reps chose to keep current."
realityCheckLinkedPillar: "why-internal-win-loss-data-fails"
draft: false
---

# How to Build a Win/Loss Interview Target List

A win/loss interview target list starts with a CRM query, not a list sales selects deal by deal. Pull every deal that matches the program's scope criteria, size that raw pull well above the interview target to offset a 5-to-10 percent participation rate, and clean up contact data before outreach begins.

1. [Pull the deal population directly from the CRM](#step-1-pull-the-deal-population-directly-from-the-crm)
2. [Size the list against the participation rate](#step-2-size-the-list-against-the-participation-rate)
3. [Enrich contact data before outreach begins](#step-3-enrich-contact-data-before-outreach-begins)
4. [Exclude deals that don't belong in the sample](#step-4-exclude-deals-that-dont-belong-in-the-sample)

## Step 1: Pull the Deal Population Directly from the CRM

Query the CRM using the scope criteria already set (segment, deal size range, geography, time window), not a list a rep assembles by hand. Build the query on hard fields only: deal stage equals closed-won or closed-lost, close date falls inside the research window, segment matches the program's scope. A soft field like a rep's own "worth revisiting" flag has no place in this pull, since that judgment is exactly what a criteria-based process is designed to remove.

A sample filter set for a program scoped to Enterprise deals over the last two quarters:

```
Deal Stage: Closed Won OR Closed Lost
Close Date: Between [180 days ago] and [today]
Segment: Enterprise
Deal Size: >= $[minimum threshold]
Excludes: Deals still marked "Negotiation" or "Active"
```

Export the raw result before doing anything else to it. That export is the population the rest of this play works against, and having it as a fixed starting point makes every later exclusion in Step 4 auditable against the original set.

<div class="callout reality-check">
<span class="callout-label">Reality Check</span>

A CRM-sourced list removes formal deal-by-deal approval, but reps can still exercise informal control over who ends up reachable: an outdated title, a missing email, or a stale phone number on the buyer who left the angriest voicemail. A criteria-based pull is only as unbiased as the contact data reps chose to keep current. See [why internal win/loss data fails](/topics/why-internal-win-loss-data-fails/).

</div>

## Step 2: Size the List Against the Participation Rate

Loss interview participation typically runs around 5 percent; win interview participation runs around 10 percent. Multiply the interview target by the inverse of that rate to get the outreach list size the program actually needs, not the interview count itself.

```
Target: 20 completed loss interviews
Participation rate: ~5%
Required loss-contact list: 20 / 0.05 = 400

Target: 10 completed win interviews
Participation rate: ~10%
Required win-contact list: 10 / 0.10 = 100
```

If the raw CRM pull from Step 1 doesn't produce a population this large after Step 4's exclusions, that's a scoping decision to revisit now, either by widening the segment or extending the research window, not a gap to discover after outreach is already underway.

Consider a program scoped to Enterprise deals over the last two quarters. After Step 4's exclusions, the loss-eligible population comes to 340 contacts, short of the 400 the participation math requires. The fix isn't to lower the interview target and quietly accept fewer completed interviews. It's to extend the research window from 180 to 270 days to pull in an earlier quarter's deals, or widen the segment to include a closely adjacent Mid-Market tier, and to make that call before the first invitation goes out rather than mid-cycle when the shortfall shows up as a stalled interview count.

## Step 3: Enrich Contact Data Before Outreach Begins

CRM contact records degrade the moment a deal closes. A champion moves to a new company, a direct line routes to a switchboard, an email bounces. Verify email addresses and titles through a data-enrichment tool or a quick manual cross-check before the first invitation goes out, since a bounced or misdirected email counts against the list size calculated in Step 2 without producing a single response.

A practical enrichment pass has two parts: an automated check against an email-verification service to catch hard bounces before sending, and a manual spot-check on any contact whose title or company hasn't been touched in the CRM since before the deal closed, since that's the most common sign the record is stale. Flag records that fail both checks as unreachable rather than including them in the outreach count, and treat the corrected total as the real list size going into Step 2's math.

Prioritize enrichment on the loss-contact list first. It needs to run roughly four times the size of the win-contact list to hit the same completed-interview target, so a data gap there costs the program more outreach volume than the same gap on the smaller win list.

## Step 4: Exclude Deals That Don't Belong in the Sample

Some deals should come out of the raw pull even though they technically match the scope criteria in Step 1. Remove deals still in active renewal negotiation, since a live commercial relationship makes an interview request awkward and can bias what the buyer is willing to say. Remove any contact who has explicitly opted out of future outreach. Remove internal test or demo accounts that occasionally get marked closed-won in the CRM.

Apply these exclusions as fixed rules that treat every deal the same way, not case-by-case judgment calls about which deals are "worth" reviewing. That distinction is what keeps this step a hygiene pass rather than the same selection bias a criteria-based CRM pull was built to avoid in the first place.

Keep a short exclusion log alongside the final list: how many records came out of the Step 1 export, under which rule, and how many remain. That log is what lets anyone question the final target list later and get a specific answer, rather than a general assurance that the list is representative.

## Related

### Other Plays in This Phase
- [How to Get Sales Buy-In for Win/Loss Interview Access](/playbook/get-sales-buy-in-for-win-loss-interviews/)
- [How to Write a Win/Loss Interview Outreach Sequence](/playbook/write-a-win-loss-interview-outreach-sequence/)

### Next Phase
- [How to Design a Win/Loss Interview Questionnaire](/playbook/design-a-win-loss-interview-questionnaire/)

### Relevant Pillars
- [Why Internal Win/Loss Data Fails](/topics/why-internal-win-loss-data-fails/)
- [Win/Loss Research Methodology](/topics/win-loss-research-methodology/)

[Get the downloadable Playbook →](/playbook/win-loss-analysis-playbook/)
