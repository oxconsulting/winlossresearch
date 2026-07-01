// src/pages/feed.xml.ts
//
// RSS feed for the Perspectives collection.
// Full post content (not excerpts) per the skill requirement.
// Advertised via <link rel="alternate"> in BaseLayout.astro.

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE_URL, SITE_NAME, AUTHOR_NAME } from '../utils/schema';

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('perspectives');

  // Sort by publishDate descending
  const sorted = posts.sort(
    (a, b) =>
      new Date(b.data.publishDate).getTime() -
      new Date(a.data.publishDate).getTime(),
  );

  return rss({
    title: `${SITE_NAME} — Perspectives`,
    description:
      "Daniel Oxenburgh's point-of-view posts on win/loss research — buyer quotes, client observations, and arguments grounded in independent research.",
    site: context.site ?? SITE_URL,
    customData: `<language>en-us</language><managingEditor>${AUTHOR_NAME}</managingEditor><webMaster>${AUTHOR_NAME}</webMaster>`,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/perspectives/${post.id}/`,
      // Include full rendered content for AI crawlers and RSS readers.
      // post.body is the raw markdown; render it at build time if you need HTML.
      content: post.body,
    })),
  });
};
