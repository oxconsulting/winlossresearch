---
title: "Garbage In, Garbage Out in Win/Loss Research"
description: "Garbage in, garbage out means AI output quality is bounded by input quality, no matter how polished the model's synthesis reads."
term: "Garbage in, garbage out"
definition: "The principle that AI output quality is bounded by the quality of its inputs, so applying a model to structurally incomplete win/loss data produces confident-sounding but unreliable conclusions."
pillar: "ai-win-loss-research"
draft: false
---

# Garbage In, Garbage Out

Garbage in, garbage out describes the principle that an AI model's output can only be as reliable as the data fed into it, regardless of how polished or confident the output reads. In win/loss research, the term applies specifically to what happens when a model is pointed at CRM notes, call recordings, or rep debriefs: inputs that were never a complete or unbiased account of the buyer's decision in the first place.

The phrase predates AI by decades, but win/loss research gives it a sharper edge than most applications. In many domains, bad input data produces output that looks obviously wrong, missing values, broken formatting, nonsensical numbers. Win/loss data does not fail that way. CRM notes are internally consistent. Call transcripts are accurately transcribed. The individual data points are true as far as they go. The failure is structural rather than mechanical: the data was never designed to capture the full picture, so a model trained to find patterns in it will find patterns that reflect the collection gap rather than the buyer's actual decision.

Consider a CRM instance where every rep logs their own interpretation of a loss reason. One rep writes "went with a competitor," another writes "budget," a third writes "no response after final call." Each entry reflects what that rep observed and chose to record, filtered through their own read of the deal and, often, an incentive to log a defensible reason rather than an uncomfortable one. Run a model over that dataset and it will return a clean-looking breakdown of loss reasons by percentage, one that accurately summarizes what reps wrote while saying nothing reliable about why buyers actually chose not to buy.

The same dynamic applies to call recordings. A model summarizing a library of sales calls will surface patterns in how a team sells and what objections got raised on recorded lines. It has no way to detect the internal buying committee conversation that happened after the call ended, the stakeholder who never joined a call at all, or the buyer who softened an objection because the conversation was being recorded.

Garbage in, garbage out is the reason AI win/loss analysis run on internal data and AI-generated buyer insight both carry the same underlying risk: not that the model hallucinates, but that it produces something that reads like the truth. The fix is changing what goes in before the model is ever involved, not upgrading the model or the prompt, and that's exactly what independent buyer interviews are designed to do.

## Related Terms

- [AI win/loss analysis](/glossary/ai-win-loss-analysis/)
- [Call recording analysis](/glossary/call-recording-analysis/)
- [CRM loss reason](/glossary/crm-loss-reason/)

## See Also

- [AI and Win/Loss Research: What Works and What Doesn't](/topics/ai-win-loss-research/)
- [Can AI make CRM data more reliable for win/loss analysis?](/faq/can-ai-make-crm-data-more-reliable-for-win-loss/)
