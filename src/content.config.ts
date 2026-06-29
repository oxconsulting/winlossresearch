import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { seoSchema } from '@jdevalk/astro-seo-graph';

const pillars = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pillars' }),
  schema: (ctx) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    seo: seoSchema(ctx.image).optional(),
  }),
});

const perspectives = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/perspectives' }),
  schema: (ctx) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    author: z.string().default('Daniel Oxenburgh'),
    authorTitle: z.string().default('Founder, Ox Win/Loss'),
    authorUrl: z.string().default('https://oxrevs.com'),
    seo: seoSchema(ctx.image).optional(),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: (ctx) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    seo: seoSchema(ctx.image).optional(),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/glossary' }),
  schema: (ctx) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    relatedTerms: z.array(z.string()).optional(),
    seo: seoSchema(ctx.image).optional(),
  }),
});

const playbook = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/playbook' }),
  schema: (ctx) => z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    seo: seoSchema(ctx.image).optional(),
  }),
});

export const collections = { pillars, perspectives, faq, glossary, playbook };
