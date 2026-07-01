/**
 * src/utils/schema.ts
 *
 * Centralized JSON-LD graph builder for winlossresearch.com.
 * Uses @jdevalk/seo-graph-core piece builders.
 *
 * Usage in page layouts:
 *   import { buildPageGraph, type PageGraphOptions } from '../utils/schema';
 *   const graph = buildPageGraph({ pageType: 'article', ... });
 *   // Then: <Seo graph={graph} ... />
 *
 * CHANGE FROM PRIOR VERSION:
 * - 'article' pageType's publishDate is now optional. The pillars collection
 *   has no publishDate field (evergreen reference content, by design — see
 *   content.config.ts). Previously this branch required publishDate to be
 *   truthy to fire at all, which meant pillar pages could never receive
 *   Article schema and silently fell through to the generic 'list' graph.
 * - Added AUTHOR_ORG_URL as a named constant instead of the business URL
 *   being hardcoded inline in two places (sameAs, worksFor.url) with no
 *   single source of truth. Same category of drift risk as the prior
 *   oxrevs.com -> oxwinloss.com hardcoded-URL incident.
 */

import {
  makeIds,
  buildWebSite,
  buildWebPage,
  buildArticle,
  buildBreadcrumbList,
  buildImageObject,
  buildPiece,
  assembleGraph,
  type IdFactory,
} from '@jdevalk/seo-graph-core';
import type { FAQPage, DefinedTerm, DefinedTermSet, Person } from 'schema-dts';

// ─── Site-wide constants ─────────────────────────────────────────────────────

export const SITE_URL = 'https://winlossresearch.com';
export const SITE_NAME = 'Win/Loss Research';
export const AUTHOR_NAME = 'Daniel Oxenburgh';
export const AUTHOR_TITLE = 'Founder, Ox Win/Loss';
export const AUTHOR_URL = `${SITE_URL}/about/`;
export const AUTHOR_ORG_URL = 'https://www.oxwinloss.com';

/** Stable IDs for all entities */
export const ids: IdFactory = makeIds({
  siteUrl: SITE_URL,
  personUrl: AUTHOR_URL,
});

// ─── Site-wide entities (included on every page) ─────────────────────────────

function buildSiteWideEntities() {
  const website = buildWebSite(
    {
      url: SITE_URL,
      name: SITE_NAME,
      description:
        'Independent reference site on win/loss research methodology for B2B SaaS and enterprise technology companies.',
      inLanguage: 'en-US',
      publisher: { '@id': ids.person },
    },
    ids,
  );

  const person = buildPiece<Person>({
    '@type': 'Person',
    '@id': ids.person,
    name: AUTHOR_NAME,
    jobTitle: AUTHOR_TITLE,
    url: AUTHOR_URL,
    sameAs: [
      'https://www.linkedin.com/in/danieloxenburgh/', // update with actual LinkedIn URL
      AUTHOR_ORG_URL,
    ],
    knowsAbout: [
      'Win/loss research',
      'B2B SaaS competitive intelligence',
      'Buyer interviews',
      'Go-to-market strategy',
      'Product marketing',
      'Sales execution analysis',
    ],
    worksFor: {
      '@type': 'Organization',
      '@id': ids.organization('ox-win-loss'),
      name: 'Ox Win/Loss',
      url: AUTHOR_ORG_URL,
    },
  });

  return [website, person];
}

// ─── Page graph types ─────────────────────────────────────────────────────────

export type PageGraphOptions =
  | { pageType: 'home' | 'list'; url: string; name: string; description: string }
  | {
      pageType: 'article';
      url: string;
      name: string;
      description: string;
      /** Optional — pillar pages have no publishDate (evergreen reference content) */
      publishDate?: Date;
      modifiedDate?: Date;
      breadcrumbs?: Array<{ name: string; url: string }>;
      imageUrl?: string;
    }
  | {
      pageType: 'faq';
      url: string;
      name: string;
      description: string;
      question: string;
      answer: string;
      breadcrumbs?: Array<{ name: string; url: string }>;
    }
  | {
      pageType: 'glossary';
      url: string;
      name: string;
      description: string;
      termName: string;
      termDefinition: string;
      breadcrumbs?: Array<{ name: string; url: string }>;
    }
  | {
      pageType: 'perspectives';
      url: string;
      name: string;
      description: string;
      publishDate: Date;
      modifiedDate?: Date;
      breadcrumbs?: Array<{ name: string; url: string }>;
      imageUrl?: string;
    };

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildPageGraph(options: PageGraphOptions): object {
  const siteWide = buildSiteWideEntities();

  const webpage = buildWebPage(
    {
      url: options.url,
      name: options.name,
      description: options.description,
      isPartOf: { '@id': ids.website },
      author: { '@id': ids.person },
      inLanguage: 'en-US',
    },
    ids,
  );

  const pieces: object[] = [...siteWide, webpage];

  // Breadcrumbs
  if (
    (options.pageType === 'article' ||
      options.pageType === 'faq' ||
      options.pageType === 'glossary' ||
      options.pageType === 'perspectives') &&
    options.breadcrumbs?.length
  ) {
    const breadcrumb = buildBreadcrumbList(
      {
        url: options.url,
        items: [
          { name: SITE_NAME, url: SITE_URL },
          ...options.breadcrumbs,
        ],
      },
      ids,
    );
    pieces.push(breadcrumb);
  }

  // Article for pillar pages (publishDate optional — pillars have none)
  if (options.pageType === 'article') {
    const ogImage = options.imageUrl
      ? buildImageObject(
          {
            url: options.imageUrl,
            width: 1200,
            height: 675,
            pageUrl: options.url,
          },
          ids,
        )
      : undefined;

    if (ogImage) pieces.push(ogImage);

    const article = buildArticle(
      {
        url: options.url,
        headline: options.name,
        description: options.description,
        ...(options.publishDate
          ? {
              publishDate: options.publishDate,
              modifiedDate: options.modifiedDate ?? options.publishDate,
            }
          : {}),
        author: { '@id': ids.person },
        publisher: { '@id': ids.person },
        isPartOf: { '@id': ids.webPage(options.url) },
        image: ogImage ? { '@id': ids.primaryImage(options.url) } : undefined,
        inLanguage: 'en-US',
      },
      ids,
    );
    pieces.push(article);
  }

  // BlogPosting for Perspectives posts
  if (options.pageType === 'perspectives') {
    const ogImage = options.imageUrl
      ? buildImageObject(
          {
            url: options.imageUrl,
            width: 1200,
            height: 675,
            pageUrl: options.url,
          },
          ids,
        )
      : undefined;

    if (ogImage) pieces.push(ogImage);

    // BlogPosting is a subtype of Article; use buildArticle and override @type
    const blogPosting = buildArticle(
      {
        url: options.url,
        headline: options.name,
        description: options.description,
        publishDate: options.publishDate,
        modifiedDate: options.modifiedDate ?? options.publishDate,
        author: { '@id': ids.person },
        publisher: { '@id': ids.person },
        isPartOf: { '@id': ids.webPage(options.url) },
        image: ogImage ? { '@id': ids.primaryImage(options.url) } : undefined,
        inLanguage: 'en-US',
      },
      ids,
    );
    // Patch @type to BlogPosting
    const patched = { ...blogPosting, '@type': 'BlogPosting' };
    pieces.push(patched);
  }

  // FAQPage schema for individual FAQ pages
  if (options.pageType === 'faq') {
    const faqPage = buildPiece<FAQPage>({
      '@type': 'FAQPage',
      '@id': `${options.url}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: options.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: options.answer,
          },
        },
      ],
    });
    pieces.push(faqPage);
  }

  // DefinedTerm schema for glossary pages
  if (options.pageType === 'glossary') {
    const definedTerm = buildPiece<DefinedTerm>({
      '@type': 'DefinedTerm',
      '@id': `${options.url}#term`,
      name: options.termName,
      description: options.termDefinition,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        '@id': `${SITE_URL}/glossary/#termset`,
        name: `${SITE_NAME} Glossary`,
        url: `${SITE_URL}/glossary/`,
      } as DefinedTermSet,
    });
    pieces.push(definedTerm);
  }

  return assembleGraph(pieces, { warnOnDanglingReferences: true });
}
