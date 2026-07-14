// src/pages/playbook/[...slug].md.ts
//
// Markdown alternate for playbook plays. Mirrors
// src/pages/playbook/[...slug].astro: same collection, same
// play.id-as-slug, no draft filter (matches current HTML route behavior).
// Does not cover /playbook/win-loss-analysis-playbook/ — that's a
// standalone landing page outside the playbook content collection, not a
// collection entry, so no markdown alternate applies to it here.
import { getCollection } from 'astro:content';
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph';
import { SITE_URL } from '../../utils/schema';

export async function getStaticPaths() {
  const plays = await getCollection('playbook');
  return plays.map((play) => ({ params: { slug: play.id } }));
}

export const GET = createMarkdownEndpoint({
  entries: () => getCollection('playbook'),
  mapper: (play, slug) =>
    play.id !== slug
      ? null
      : {
          frontmatter: {
            title: play.data.title,
            canonical: `${SITE_URL}/playbook/${play.id}/`,
            // Playbook collection has no publishDate field — omitted.
            description: play.data.description,
          },
          body: play.body ?? '',
        },
});
