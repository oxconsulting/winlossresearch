// src/pages/topics/[...slug].md.ts
//
// Markdown alternate for pillar pages. Mirrors src/pages/topics/[...slug].astro:
// same collection, same entry.id-as-slug, no draft filter (matches current
// HTML route behavior exactly — see Session D notes on the missing draft
// gate in perspectives, which applies identically here).
import { getCollection } from 'astro:content';
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph';
import { SITE_URL } from '../../utils/schema';

export async function getStaticPaths() {
  const entries = await getCollection('pillars');
  return entries.map((entry) => ({ params: { slug: entry.id } }));
}

export const GET = createMarkdownEndpoint({
  entries: () => getCollection('pillars'),
  mapper: (entry, slug) =>
    entry.id !== slug
      ? null
      : {
          frontmatter: {
            title: entry.data.title,
            canonical: `${SITE_URL}/topics/${entry.id}/`,
            // Pillars collection has no publishDate/modifiedDate field —
            // omitted, not defaulted, per src/content.config.ts.
            description: entry.data.description,
          },
          body: entry.body ?? '',
        },
});
