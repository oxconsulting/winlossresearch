// src/pages/perspectives/[...slug].md.ts
//
// Markdown alternate for Perspectives posts. Mirrors
// src/pages/perspectives/[...slug].astro: same collection, same
// entry.id-as-slug, no draft filter (matches the current HTML route
// exactly — see Session D notes: getStaticPaths there has no draft gate
// today, so this endpoint stays consistent with that, not with the
// intended drip-publish behavior).
import { getCollection } from 'astro:content';
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph';
import { SITE_URL, AUTHOR_NAME } from '../../utils/schema';

export async function getStaticPaths() {
  const entries = await getCollection('perspectives');
  return entries.map((entry) => ({ params: { slug: entry.id } }));
}

export const GET = createMarkdownEndpoint({
  entries: () => getCollection('perspectives'),
  mapper: (entry, slug) =>
    entry.id !== slug
      ? null
      : {
          frontmatter: {
            title: entry.data.title,
            canonical: `${SITE_URL}/perspectives/${entry.id}/`,
            pubDate: entry.data.publishDate,
            updatedDate: entry.data.modifiedDate,
            author: AUTHOR_NAME,
            description: entry.data.description,
          },
          body: entry.body ?? '',
        },
});
