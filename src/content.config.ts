import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sharedSeo = z.object({
  title: z.string().min(5).max(120).optional(),
  description: z.string().min(15).max(160).optional(),
}).optional();

const pillars = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pillars' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillarSlug: z.string(),
    order: z.number().int().min(1).max(10),
    seo: sharedSeo,
  }),
});

const perspectives = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/perspectives' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Daniel Oxenburgh'),
    pillar: z.string(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    seo: sharedSeo,
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    relatedFaq: z.array(z.string()).optional(),
    seo: sharedSeo,
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/glossary' }),
  schema: z.object({
    term: z.string(),
    definition: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    relatedTerms: z.array(z.string()).optional(),
    relatedFaq: z.array(z.string()).optional(),
    seo: sharedSeo,
  }),
});

const playbook = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/playbook' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    pillar: z.string(),
    order: z.number().int().optional(),
    seo: sharedSeo,
  }),
});

export const collections = {
  pillars,
  perspectives,
  faq,
  glossary,
  playbook,
};
