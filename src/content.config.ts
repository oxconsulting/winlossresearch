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

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Pillar slug enum ───────────────────────────────────────────────────────
const PILLAR_SLUGS = [
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
  schema: z.object({
    title: seoTitle,
    description: seoDescription,
    pillar: pillarSlug,
    draft: z.boolean().default(false),
  }),
});

export const collections = { pillars, perspectives, faq, glossary, playbook };
