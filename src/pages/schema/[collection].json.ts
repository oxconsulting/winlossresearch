// src/pages/schema/[collection].json.ts
//
// Per-collection schema endpoints for AI agent discovery.

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import {
  buildWebSite,
  buildArticle,
  buildPiece,
  assembleGraph,
} from '@jdevalk/seo-graph-core';
import type { BlogPosting, FAQPage, DefinedTerm } from 'schema-dts';
import { SITE_URL, SITE_NAME, ids } from '../../utils/schema';

type SupportedCollection = 'perspectives' | 'pillars' | 'faq' | 'glossary';
const SUPPORTED: SupportedCollection[] = ['perspectives', 'pillars', 'faq', 'glossary'];

export const getStaticPaths: GetStaticPaths = async () => {
  return SUPPORTED.map((collection) => ({ params: { collection } }));
};

export const GET: APIRoute = async ({ params }) => {
  const collection = params.collection as SupportedCollection;

  if (!SUPPORTED.includes(collection)) {
    return new Response(JSON.stringify({ error: 'Collection not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const entries = await getCollection(collection as any);

  const website = buildWebSite(
    {
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': ids.person },
      inLanguage: 'en-US',
    },
    ids,
  );

  let pieces: object[] = [website];

  for (const entry of entries) {
    const { data, id, body } = entry as any;
    const url = `${SITE_URL}/${collection === 'pillars' ? 'topics' : collection}/${id}/`;
    const articleBody = body?.slice(0, 10000) ?? '';

    if (collection === 'perspectives') {
      const piece = buildPiece<BlogPosting>({
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: data.title,
        description: data.description,
        url,
        datePublished: data.publishDate?.toISOString(),
        dateModified: (data.modifiedDate ?? data.publishDate)?.toISOString(),
        author: { '@id': ids.person },
        publisher: { '@id': ids.person },
        articleBody,
        inLanguage: 'en-US',
        isPartOf: { '@id': ids.website },
      });
      pieces.push(piece);
    } else if (collection === 'pillars') {
      const article = buildArticle(
        {
          url,
          headline: data.title,
          description: data.description,
          author: { '@id': ids.person },
          publisher: { '@id': ids.person },
          inLanguage: 'en-US',
        },
        ids,
      );
      pieces.push({ ...article, articleBody });
    } else if (collection === 'faq') {
      const piece = buildPiece<FAQPage>({
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        url,
        name: data.title,
        description: data.description,
        mainEntity: [
          {
            '@type': 'Question',
            name: data.title,
            acceptedAnswer: {
              '@type': 'Answer',
              text: data.answer ?? articleBody.slice(0, 500),
            },
          },
        ],
      });
      pieces.push(piece);
    } else if (collection === 'glossary') {
      // FIX: was reading data.description here — now reads data.definition
      // first, matching the DefinedTerm.description field the glossary
      // skill specifies. Falls back to data.description only if definition
      // is somehow absent, so this can't regress to a hard failure.
      const piece = buildPiece<DefinedTerm>({
        '@type': 'DefinedTerm',
        '@id': `${url}#term`,
        name: data.term ?? data.title,
        description: data.definition ?? data.description,
        url,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          '@id': `${SITE_URL}/glossary/#termset`,
          name: `${SITE_NAME} Glossary`,
          url: `${SITE_URL}/glossary/`,
        } as any,
      });
      pieces.push(piece);
    }
  }

  const graph = assembleGraph(pieces, { warnOnDanglingReferences: true });

  return new Response(JSON.stringify(graph, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
