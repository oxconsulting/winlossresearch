import { createSchemaMap } from '@jdevalk/astro-seo-graph';
import { SITE_URL } from '../utils/schema';

export const GET = createSchemaMap({
  siteUrl: SITE_URL,
  entries: [
    { path: '/schema/perspectives.json', lastModified: new Date() },
    { path: '/schema/pillars.json', lastModified: new Date() },
    { path: '/schema/faq.json', lastModified: new Date() },
    { path: '/schema/glossary.json', lastModified: new Date() },
  ],
});
