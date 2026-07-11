---
title: "How to Code Win/Loss Interview Responses"
description: "Tag interview notes against a taxonomy built from the questionnaire's categories, adapted to an existing CRM's codes where useful."
phase: "analyze"
phaseOrder: 1
relatedPillars: ["win-loss-research-methodology"]
draft: false
---

# How to Code Win/Loss Interview Responses

Coding a win/loss interview means tagging raw notes against a consistent taxonomy immediately after each call, not in a batch once the full interview set is complete. Build that taxonomy from the same categories the questionnaire covers, tag every interview against it the same way, and track code frequency as interviews accumulate so a recurring theme becomes visible as soon as it crosses the pattern threshold.

1. [Code immediately after each interview, not in batches](#step-1-code-immediately-after-each-interview-not-in-batches)
2. [Build the coding taxonomy from the questionnaire's categories](#step-2-build-the-coding-taxonomy-from-the-questionnaires-categories)
3. [Tag consistently across the full interview set](#step-3-tag-consistently-across-the-full-interview-set)
4. [Track code frequency as interviews accumulate](#step-4-track-code-frequency-as-interviews-accumulate)
5. [Choose tooling that fits the program's size](#step-5-choose-tooling-that-fits-the-programs-size)

## Step 1: Code Immediately After Each Interview, Not in Batches

Code each interview within a day of conducting it, while the specific phrasing and context are still fresh. The interviewer's own impression of what a buyer meant by a vague comment degrades the same way a buyer's memory of a deal degrades over time, so a note like "mentioned onboarding, seemed like a real concern" written the same day carries more usable signal than the same note reconstructed from a transcript two weeks later.

Coding in batches after five or ten interviews also invites a specific failure: early impressions blur together, and a theme that was actually distinct across three different buyers starts to read as one repeated comment because the coder no longer remembers which buyer said what.

Build the coding pass directly into the post-call routine established in the interview play: capture the unresolved-thread notes immediately after hanging up, then apply codes to the full call notes before starting the next scheduled interview. Treating coding as a same-day task rather than an end-of-week catch-up keeps the taxonomy from Step 2 accurate to what buyers actually said, not to a compressed summary of it.

## Step 2: Build the Coding Taxonomy from the Questionnaire's Categories

Use the questionnaire's five stages as the top-level structure, so a code maps cleanly back to the question that produced it, but build the specific codes within each stage from what the interviews actually surface rather than adopting a fixed list. The categories below the stage level are illustrative, one plausible set for one hypothetical program, not a standard vocabulary to apply unchanged across every engagement.

<div class="example-block">
<span class="example-label">Example</span>
<pre>Buying Process &amp; Criteria:  Committee-Stakeholder-Objection,
                             Budget-Approval-Friction
Competitive Landscape:      Competitor-Pricing-Comparison,
                             Feature-Gap-Named
Product &amp; Messaging:        Demo-Objection,
                             Onboarding-Concern
Outcome Drivers:            Price-Cited,
                             Champion-Lost-Internal-Argument
Other:                      [open tag for anything outside
                             the categories above]</pre>
</div>

Where a company already codes losses in its CRM with a reasonably specific set of categories, align the interview taxonomy to those categories rather than building an entirely separate vocabulary. Matching, say, an existing "Pricing/Budget" or "Competitive Loss" field lets the coded interview findings sit directly next to the CRM's own loss-reason distribution once analysis is complete, which is often the clearest way to show where the two diverge, not just that they do. Build new codes only where the interviews surface a theme the CRM's existing categories don't capture at all.

Keep the "Other" tag genuinely open rather than forcing every comment into an existing code. A comment that gets stretched to fit the nearest available tag loses the specificity that made it worth coding in the first place, and a growing "Other" list across several interviews is itself a signal that the taxonomy is missing a real category.

## Step 3: Tag Consistently Across the Full Interview Set

Apply the same code to the same underlying concern every time it appears, even when different buyers describe it in different words. A buyer who says "the pricing felt like it had hidden levers" and another who says "we couldn't tell what we'd actually end up paying" are both describing pricing opacity, and both should carry the same code, not two separate ones that happen to look different on paper.

Re-read the taxonomy against the first three or four coded interviews before continuing through the rest of the set. Codes that seemed distinct in isolation often turn out to describe the same underlying concern once a few interviews are sitting side by side, and it's easier to consolidate two codes into one early than to recode a full set after the fact.

A practical example: interview three gets coded "Pricing-Opacity" and interview five gets coded separately as "Hidden-Fees-Concern." Reviewing both notes together after interview five shows they're describing the same underlying issue in different words, not two distinct pricing problems. Merging them into a single "Pricing-Opacity" code before interview six keeps the frequency count in Step 4 accurate; leaving them split would understate how often the theme is actually recurring, and could keep a real pattern below the three-mention threshold on a technicality.

## Step 4: Track Code Frequency as Interviews Accumulate

Maintain a running count of how many interviews carry each code, updated after every coding session rather than reconstructed at the end. A code that reaches three to five independent mentions, unprompted and in the buyer's own words, crosses the threshold that separates a pattern from an anecdote.

<div class="example-block">
<span class="example-label">Example</span>
<pre>Code: Champion-Lost-Internal-Argument
Interviews: #4, #9, #15, #22
Frequency: 4 of 20 loss interviews (20%)</pre>
</div>

Watching this count grow in real time, rather than discovering it during a single end-of-cycle analysis pass, surfaces an emerging pattern early enough to probe it more deliberately in the remaining interviews still on the calendar.

## Step 5: Choose Tooling That Fits the Program's Size

A standard 20-to-30 interview program doesn't need a dedicated qualitative-analysis platform. A shared spreadsheet with one row per interview and one column per code, marked with a simple count or checkmark, is enough to support the frequency tracking in Step 4 and stays easy for more than one person to work from during analysis.

<div class="example-block">
<span class="example-label">Example</span>
<pre>Interview ID | Type | Onboarding-Concern | Price-Cited | Feature-Gap-Named | ...
#4           | Loss | -                   | X           | -                  |
#9           | Loss | X                   | -           | X                  |
#12          | Loss | X                   | -           | -                  |
#15          | Loss | X                   | X           | -                  |</pre>
</div>

Reserve a specialized coding tool for programs running well beyond 30 interviews or maintaining a continuously updated interview set across multiple cycles, where a spreadsheet's manual upkeep starts to outweigh its simplicity.

## Related

### Other Plays in This Phase
- [How to Distinguish a Pattern from an Anecdote in Win/Loss Data](/playbook/distinguish-a-pattern-from-an-anecdote/)

### Next Phase
- [How to Deliver a Win/Loss Readout](/playbook/deliver-a-win-loss-readout/)

### Relevant Pillars
- [Win/Loss Research Methodology](/topics/win-loss-research-methodology/)

[Get the downloadable Playbook →](/playbook/win-loss-analysis-playbook/)
