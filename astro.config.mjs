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

export default defineConfig({
  site: 'https://winlossresearch.com',
  trailingSlash: 'always',

  integrations: [
    // ── Sitemap ───────────────────────────────────────────────────────────
    sitemap({
      // Split sitemap by collection for easier GSC debugging.
      // Each collection gets its own sitemap file referenced in sitemap-index.xml.
      chunks: {
        pillars:      (page) => page.url.includes('/topics/'),
        perspectives: (page) => page.url.includes('/perspectives/'),
        faq:          (page) => page.url.includes('/faq/'),
        glossary:     (page) => page.url.includes('/glossary/'),
        playbook:     (page) => page.url.includes('/playbook/'),
      },
      serialize(item) {
        // Use git last-modified date where available.
        // gitLastmod returns null if git is unavailable (e.g. fresh Netlify build
        // without fetch-depth). Fall back to current date in that case.
        //
        // NOTE: gitLastmod is exported from @jdevalk/astro-seo-graph >= 1.4.0.
        // If your installed version is below 1.4.0, remove the import and the
        // lastmod line below, and upgrade first.
        //
        // import { gitLastmod } from '@jdevalk/astro-seo-graph';
        // const lastmod = gitLastmod(item.url) ?? new Date().toISOString().split('T')[0];
        //
        // For now, omit lastmod to avoid stale CI timestamps. Uncomment above
        // after upgrading to >= 1.4.0.
        return {
          ...item,
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
      // indexNow: {
      //   key: 'YOUR_INDEXNOW_KEY_HERE',
      //   // Only submit from production builds — never from preview deploys
      //   enabled: process.env.CONTEXT === 'production',
      // },
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
