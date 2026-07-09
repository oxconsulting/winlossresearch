// src/content.config.ts
//
// This is the file Astro actually resolves for content collections in this
// project (Astro 7 prefers a root-level src/content.config.ts over
// src/content/config.ts when both exist).
//
// Preserves the original loader: glob() pattern from Session 1 — only the
// schemas have been updated to match current frontmatter decisions:
//   - pillar: slug string (enum-validated), not integer
//   - Pillars: no publishDate/pillar field — file slug is the identifier
//   - FAQ/Glossary: no publishDate — reference content, no freshness dates
//   - Perspectives: publishDate required; author fields removed from
//     frontmatter (handled by schema utility + template instead)
//   - seoSchema import removed — incompatible with Astro 7 per prior session
//   - Playbook: replaced the Session 1 placeholder schema (title,
//     description, single `pillar`, draft) with the schema defined in
//     playbook-page-SKILL.md — phase grouping, multi-pillar linking, and
//     the Reality Check single-source fields the on-page callout and future
//     PDF compile both read from. The `realityCheck*` fields are enforced
//     as conditionally required via `.refine()` rather than left to
//     documentation discipline alone.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Pillar slug enum ───────────────────────────────────────────────────────
export const PILLAR_SLUGS = [
  'why-internal-win-loss-data-fails',
  'independent-win-loss-research',
  'win-loss-research-methodology',
  'b2b-buying-committee-decisions',
  'win-loss-competitive-intelligence',
  'win-loss-product-marketing',
  'win-loss-sales-execution',
  'win-loss-gtm-strategy',
  'ai-win-loss-research',
  'how-to-build-win-loss-program',
] as const;

const pillarSlug = z.enum(PILLAR_SLUGS);

// ── Playbook phase enum ─────────────────────────────────────────────────────
// Order matches content-architecture.md Section 8. Used to group plays on
// the /playbook/ index page and to drive the "other plays in this phase" /
// "next phase" links in each play's Related block.
export const PLAYBOOK_PHASES = [
  'scope-design',
  'recruit-outreach',
  'interview',
  'analyze',
  'report-distribute',
  'sustain',
] as const;

const playbookPhase = z.enum(PLAYBOOK_PHASES);

const seoTitle = z.string().min(5).max(120);
const seoDescription = z.string().min(15).max(160);
const seoDescriptionLong = z.string().min(15).max(300);

// ── Pillars ─────────────────────────────────────────────────────────────
const pillars = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pillars' }),
  schema: z.object({
    title: seoTitle,
    description: seoDescriptionLong,
    shortTitle: z.string().max(60),
    draft: z.boolean().default(false),
  }),
});

// ── Perspectives ────────────────────────────────────────────────────────
const perspectives = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/perspectives' }),
  schema: z.object({
    title: seoTitle,
    description: seoDescription,
    publishDate: z.coerce.date(),
    modifiedDate: z.coerce.date().optional(),
    pillar: pillarSlug,
    pillarSecondary: pillarSlug.optional(),
    excerpt: z.string().min(15).max(200),
    draft: z.boolean().default(false),
  }),
});

// ── FAQ ─────────────────────────────────────────────────────────────────
const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    title: seoTitle,
    description: seoDescription,
    pillar: pillarSlug,
    answer: z.string().min(40).max(600),
    draft: z.boolean().default(false),
  }),
});

// ── Glossary ────────────────────────────────────────────────────────────
const glossary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/glossary' }),
  schema: z.object({
    title: seoTitle,
    description: seoDescription,
    term: z.string().min(2).max(80),
    definition: z.string().min(20).max(300),
    pillar: pillarSlug,
    draft: z.boolean().default(false),
  }),
});

// ── Playbook ────────────────────────────────────────────────────────────
const playbook = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/playbook' }),
  schema: z
    .object({
      title: seoTitle,
      description: seoDescription,
      phase: playbookPhase,
      phaseOrder: z.number().int().positive(),
      // Plural, unlike FAQ/glossary's single `pillar` — a play can
      // legitimately owe a link to more than one pillar argument.
      relatedPillars: z.array(pillarSlug).min(1),
      realityCheck: z.boolean().default(false),
      // Required only when realityCheck is true — enforced below via
      // .refine() rather than left to documentation discipline alone.
      realityCheckText: z.string().min(20).max(400).optional(),
      realityCheckLinkedPillar: pillarSlug.optional(),
      draft: z.boolean().default(false),
    })
    .refine(
      (data) =>
        !data.realityCheck ||
        (!!data.realityCheckText && !!data.realityCheckLinkedPillar),
      {
        message:
          'realityCheckText and realityCheckLinkedPillar are required when realityCheck is true',
        path: ['realityCheck'],
      },
    ),
});

export const collections = { pillars, perspectives, faq, glossary, playbook };
