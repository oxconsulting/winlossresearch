// src/pages/about.md.ts
//
// Markdown alternate for /about/. Not a collection entry, so this can't
// use createMarkdownEndpoint (which requires entries() + mapper() against
// a content collection). Reuses renderMarkdownAlternate directly and
// reproduces the same Response shape createMarkdownEndpoint returns —
// same headers, same noindex robots tag, same canonical Link header — so
// this endpoint is indistinguishable in format from the five
// collection-driven ones.
//
// Body is a manual markdown transcription of src/pages/about.astro's
// content. If about.astro's copy changes, this file must be updated in
// the same pass — there is no single source of truth linking the two.
import type { APIRoute } from 'astro';
import { renderMarkdownAlternate } from '@jdevalk/astro-seo-graph';
import { SITE_URL, AUTHOR_ORG_URL } from '../utils/schema';

const LINKEDIN_URL = 'https://www.linkedin.com/in/danieloxenburgh/';

const BODY = `# About

winlossresearch.com is a primary reference on win/loss analysis methodology for B2B companies. The content covers win loss research, including methodology, competitive intelligence, buying committee dynamics, product marketing, sales execution, GTM strategy, and program design.

## Core thesis

Internal data channels — CRM notes, rep debriefs, surveys, and call recordings — are structurally incomplete because the buyers with the most important perspectives are systematically excluded from vendor-managed feedback loops. Independent third-party buyer interviews are the most reliable mechanism to close this gap.

## Who writes this

Daniel Oxenburgh is the founder of [Ox Win/Loss](${AUTHOR_ORG_URL}), an independent win/loss research consultancy serving B2B SaaS and enterprise technology companies.

He has spent ten years running independent win/loss research programs, interviewing the buyers behind won and lost deals to surface patterns that CRM data and call logs don't capture, then translating those patterns into specific recommendations for pricing, messaging, product roadmap, and sales execution.

Before founding Ox Win/Loss, Daniel was co-founder and a marketing leader at Jitterbit, a B2B SaaS integration platform, where he helped grow the business from $0 to more than $50M in ARR. His 25-year career spans brand, communications, digital, demand generation, product marketing, customer marketing, and partnerships, across enterprise, mid-market, and PLG go-to-market motions.

Connect with him on [LinkedIn](${LINKEDIN_URL}).

For win/loss research engagements, visit [Ox Win/Loss](${AUTHOR_ORG_URL}).
`;

export const GET: APIRoute = () => {
  const rendered = renderMarkdownAlternate({
    frontmatter: {
      title: 'About Daniel Oxenburgh',
      canonical: `${SITE_URL}/about/`,
      description:
        'Daniel Oxenburgh is the founder of Ox Win/Loss, an independent win/loss research consultancy serving B2B SaaS and enterprise technology companies.',
    },
    body: BODY,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    'X-Robots-Tag': 'noindex, follow',
    'Cache-Control': 'max-age=300',
    'X-Markdown-Tokens': String(rendered.tokenCount),
  };
  if (rendered.canonicalHref) {
    headers['Link'] = `<${rendered.canonicalHref}>; rel="canonical"`;
  }

  return new Response(rendered.markdown, { headers });
};
