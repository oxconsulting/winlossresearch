// astro.config.mjs
//
// CHANGES FROM PRIOR VERSION:
// 1. seoGraph() integration added with validateH1, validateUniqueMetadata,
//    validateImageAlt, validateMetadataLength, validateInternalLinks
// 2. @astrojs/sitemap updated with per-collection chunks and lastmod callback
// 3. @astrojs/rss is a dependency — feed route is at src/pages/feed.xml.ts
// 4. llmsTxt option added to seoGraph() to auto-generate /llms.txt
//    NOTE: If you use the static public/llms.txt approach instead, remove
//    the llmsTxt option here to avoid a conflict.
//
// UPGRADE NOTE: Run `npm install @jdevalk/astro-seo-graph@latest --legacy-peer-deps`
// before deploying. This config targets v2.0.0 API. Check AGENTS.md for
// any breaking changes between your current version and v2.0.0.

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import seoGraph from '@jdevalk/astro-seo-graph/integration';
import { gitLastmod } from '@jdevalk/astro-seo-graph';

export default defineConfig({
  site: 'https://winlossresearch.com',
  trailingSlash: 'always',

  integrations: [
    // ── Sitemap ───────────────────────────────────────────────────────────
    sitemap({
      // Split sitemap by collection for easier GSC debugging.
      // Each collection gets its own sitemap file referenced in sitemap-index.xml.
      chunks: {
        // Each function must return the SitemapItem itself (or undefined to
        // exclude it) per @astrojs/sitemap's type contract — NOT a bare
        // boolean. Returning true/false here (the original bug) caused every
        // <loc> in every chunked sitemap to resolve to the literal string
        // "undefined", since the boolean has no .url property to read.
        pillars:      (item) => item.url.includes('/topics/') ? item : undefined,
        perspectives: (item) => item.url.includes('/perspectives/') ? item : undefined,
        faq:          (item) => item.url.includes('/faq/') ? item : undefined,
        glossary:     (item) => item.url.includes('/glossary/') ? item : undefined,
        playbook:     (item) => item.url.includes('/playbook/') ? item : undefined,
      },
      serialize(item) {
        // Map the rendered URL back to the real content file path.
        // gitLastmod() runs `git log -- <filePath>` and needs an actual
        // filesystem path — it was previously called with item.url (a
        // rendered https:// URL), which never matches a tracked file and
        // silently returned null every time. Fixed here: derive the real
        // src/content/<collection>/<slug>.md path from the URL for the
        // five known collection patterns. Note the URL segment 'topics'
        // maps to the 'pillars' content directory, not 'topics'.
        const URL_PREFIX_TO_DIR = {
          '/faq/': 'faq',
          '/glossary/': 'glossary',
          '/topics/': 'pillars',
          '/perspectives/': 'perspectives',
          '/playbook/': 'playbook',
        };

        let filePath = null;
        for (const [urlPrefix, dir] of Object.entries(URL_PREFIX_TO_DIR)) {
          if (item.url.includes(urlPrefix)) {
            const slug = item.url.split(urlPrefix)[1]?.replace(/\/$/, '');
            if (slug) filePath = `src/content/${dir}/${slug}.md`;
            break;
          }
        }

        // Use git last-modified date where available. gitLastmod returns
        // null if git is unavailable (e.g. fresh Netlify build without
        // fetch-depth), or if filePath is null (index pages, About,
        // homepage, and the standalone win-loss-analysis-playbook page —
        // none of which are single content-collection files). Fall back
        // to current date in either case.
        const lastmod = (filePath ? gitLastmod(filePath) : null) ?? new Date().toISOString().split('T')[0];
        return {
          ...item,
          lastmod,
          // changefreq: omitted — Google ignores it
          // priority: omitted — Google ignores it
        };
      },
    }),

    // ── seoGraph ──────────────────────────────────────────────────────────
    seoGraph({
      // Build-time validation — runs on every `astro build`
      validateH1: true,             // Every page must have exactly one H1
      validateUniqueMetadata: true, // No duplicate titles or descriptions across pages
      validateImageAlt: true,       // All <img> tags must have alt attributes
      validateMetadataLength: true, // Titles 30–65 chars, descriptions 70–200 chars
      validateInternalLinks: true,  // Internal links must not 404
      markdownAlternate: true,      // Serve .md alternates + <link rel="alternate" type="text/markdown">

      // Auto-generate /llms.txt from content collections.
      // Remove this block if you are using the static public/llms.txt file instead.
      // llmsTxt: {
      //   siteUrl: 'https://winlossresearch.com',
      //   siteName: 'Win/Loss Research',
      //   description: 'Independent reference site on win/loss research methodology for B2B SaaS.',
      //   collections: ['pillars', 'perspectives', 'faq', 'glossary'],
      // },

      // IndexNow — submit URLs to Bing/Yandex on each build.
      // Uncomment after:
      //   1. DNS is pointed to winlossresearch.com
      //   2. You have generated a key (any UUID or 32-char hex string)
      //   3. You have deployed the key verification route (see src/pages/[key].txt.ts)
      // indexNow is only constructed as an object when building in
      // production — the plugin submits whenever `indexNow` is truthy,
      // it does not read an `enabled` flag itself, so gating has to
      // happen here rather than inside the options object.
      indexNow: process.env.CONTEXT === 'production' ? {
        key: '3f242644736125cc9ad5ad1af498a155',
        host: 'winlossresearch.com',
        siteUrl: 'https://winlossresearch.com',
      } : undefined,
    }),
  ],

  // ── Build output ──────────────────────────────────────────────────────
  build: {
    // Inline stylesheets under 4KB to reduce render-blocking requests
    inlineStylesheets: 'auto',
  },

  // ── Vite ──────────────────────────────────────────────────────────────
  vite: {
    build: {
      // Ensure assets get content-hashed filenames for immutable caching
      rollupOptions: {
        output: {
          assetFileNames: '_astro/[name].[hash][extname]',
          chunkFileNames: '_astro/[name].[hash].js',
          entryFileNames: '_astro/[name].[hash].js',
        },
      },
    },
  },
});
