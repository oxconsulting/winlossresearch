// src/pages/.well-known/api-catalog.ts
//
// RFC 9727 API catalog listing schema endpoints and discovery files.
// Served at /.well-known/api-catalog
// Advertised via _headers: Link: </.well-known/api-catalog>; rel="describedby"

import { createApiCatalog } from '@jdevalk/astro-seo-graph';
import { SITE_URL } from '../../utils/schema';

export const GET = createApiCatalog({
  siteUrl: SITE_URL,
  entries: [
    {
      path: '/schema/perspectives.json',
      title: 'Perspectives posts — BlogPosting JSON-LD corpus',
      type: 'https://schema.org/BlogPosting',
    },
    {
      path: '/schema/pillars.json',
      title: 'Pillar pages — Article JSON-LD corpus',
      type: 'https://schema.org/Article',
    },
    {
      path: '/schema/faq.json',
      title: 'FAQ pages — FAQPage JSON-LD corpus',
      type: 'https://schema.org/FAQPage',
    },
    {
      path: '/schema/glossary.json',
      title: 'Glossary terms — DefinedTerm JSON-LD corpus',
      type: 'https://schema.org/DefinedTerm',
    },
    {
      path: '/schemamap.xml',
      title: 'Schema map — index of all schema endpoints',
    },
    {
      path: '/sitemap-index.xml',
      title: 'Sitemap index',
    },
    {
      path: '/feed.xml',
      title: 'RSS feed — Perspectives',
      type: 'https://schema.org/RssFeed',
    },
    {
      path: '/llms.txt',
      title: 'llms.txt — AI agent discovery',
    },
  ],
});
