// src/pages/faq/[...slug].md.ts
//
// Markdown alternate for FAQ pages. Mirrors src/pages/faq/[...slug].astro:
// same collection, same entry.id-as-slug, no draft filter (matches current
// HTML route behavior).
import { getCollection } from 'astro:content';
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph';
import { SITE_URL } from '../../utils/schema';

export async function getStaticPaths() {
  const entries = await getCollection('faq');
  return entries.map((entry) => ({ params: { slug: entry.id } }));
}

export const GET = createMarkdownEndpoint({
  entries: () => getCollection('faq'),
  mapper: (entry, slug) =>
    entry.id !== slug
      ? null
      : {
          frontmatter: {
            title: entry.data.title,
            canonical: `${SITE_URL}/faq/${entry.id}/`,
            // FAQ collection has no publishDate field — omitted.
            description: entry.data.description,
          },
          body: entry.body ?? '',
        },
});
