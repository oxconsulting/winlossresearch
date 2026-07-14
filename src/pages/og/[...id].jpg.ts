import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { ImageResponse } from '@vercel/og';
import sharp from 'sharp';
import { decompress } from 'wawoff2';

export const prerender = true;

// -- Visual identity tokens (src: visual-identity.md — do not hand-edit
//    values here without updating that doc too) -----------------------
const INK = '#1B1E22';
const PAPER = '#EFECE3';
const GOLD = '#C9A227';
const MUTED = '#8B8677';

const SITE_NAME = 'Win/Loss Research';

const COLLECTIONS = ['pillars', 'perspectives', 'faq', 'glossary', 'playbook'] as const;
type CollectionName = (typeof COLLECTIONS)[number];

const SECTION_LABELS: Record<CollectionName, string> = {
  pillars: 'TOPICS',
  perspectives: 'PERSPECTIVE',
  faq: 'FAQ',
  glossary: 'GLOSSARY TERM',
  playbook: 'PLAYBOOK',
};

// -- getStaticPaths: one path per entry across all five collections ---
export async function getStaticPaths() {
  const paths: { params: { id: string } }[] = [];
  for (const collectionName of COLLECTIONS) {
    const entries = await getCollection(collectionName);
    for (const entry of entries) {
      paths.push({ params: { id: `${collectionName}/${entry.id}` } });
    }
  }
  return paths;
}

// -- Font loading (Google Fonts, fetched as normal .woff2, then
//    decompressed to .ttf locally via wawoff2 — Satori/`@vercel/og`
//    can't parse woff2 directly, see Session C build log: "Unsupported
//    OpenType signature wOF2". This avoids relying on Google's
//    UA-based legacy-format serving, which turned out to be unreliable
//    — see prior attempt in this file's history.)
// Cached at module scope so it only downloads/decompresses once per
// build, not once per generated image (~190+ pages otherwise).
let fontCache: {
  fraunces500: ArrayBuffer;
  plexMono400: ArrayBuffer;
} | null = null;

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weight}&display=swap`;

  const cssResponse = await fetch(cssUrl);
  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch font CSS for ${family} ${weight}: ${cssResponse.status}`);
  }

  const css = await cssResponse.text();
  // Google's CSS2 endpoint doesn't serve a consistent format across every
  // font/request — observed in this session: Fraunces came back as woff2,
  // IBM Plex Mono came back as truetype directly, both from the same
  // unmodified fetch() call. Handle either rather than assuming one.
  const match = css.match(/src: url\(([^)]+)\) format\('(woff2|truetype)'\)/);
  if (!match) {
    throw new Error(
      `Could not find a woff2 or truetype URL for ${family} ${weight} in Google Fonts CSS response. Response started with: ${css.slice(0, 300)}`
    );
  }
  const [, fontUrl, format] = match;

  const fontResponse = await fetch(fontUrl);
  if (!fontResponse.ok) {
    throw new Error(`Failed to fetch font file for ${family} ${weight}: ${fontResponse.status}`);
  }
  const fontBuffer = Buffer.from(await fontResponse.arrayBuffer());

  if (format === 'truetype') {
    return fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength
    ) as ArrayBuffer;
  }

  // format === 'woff2' — decompress to ttf locally, since Satori/@vercel/og
  // can't parse woff2 directly (see Session C build log: "Unsupported
  // OpenType signature wOF2").
  const ttfUint8Array = await decompress(fontBuffer);
  return ttfUint8Array.buffer.slice(
    ttfUint8Array.byteOffset,
    ttfUint8Array.byteOffset + ttfUint8Array.byteLength
  ) as ArrayBuffer;
}

async function getFonts() {
  if (!fontCache) {
    const [fraunces500, plexMono400] = await Promise.all([
      loadGoogleFont('Fraunces', 500),
      loadGoogleFont('IBM Plex Mono', 400),
    ]);
    fontCache = { fraunces500, plexMono400 };
  }
  return fontCache;
}

// -- Title lookup -------------------------------------------------------
async function lookupTitle(
  collectionName: string,
  entryId: string
): Promise<{ title: string; sectionLabel: string }> {
  if (!COLLECTIONS.includes(collectionName as CollectionName)) {
    return { title: SITE_NAME, sectionLabel: '' };
  }
  try {
    const entries = await getCollection(collectionName as CollectionName);
    const entry = entries.find((e) => e.id === entryId);
    if (entry && entry.data.title) {
      return {
        title: entry.data.title as string,
        sectionLabel: SECTION_LABELS[collectionName as CollectionName],
      };
    }
  } catch {
    // fall through to site-name fallback below
  }
  return { title: SITE_NAME, sectionLabel: '' };
}

// -- Route handler --------------------------------------------------------
export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  const slashIndex = id.indexOf('/');
  const collectionName = slashIndex === -1 ? id : id.slice(0, slashIndex);
  const entryId = slashIndex === -1 ? '' : id.slice(slashIndex + 1);

  const { title, sectionLabel } = await lookupTitle(collectionName, entryId);
  const { fraunces500, plexMono400 } = await getFonts();

  const imageResponse = new ImageResponse(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: INK,
          padding: '64px 72px',
        },
        children: [
          // -- Top row: badge + wordmark --
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '20px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '72px',
                      height: '72px',
                      backgroundColor: GOLD,
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    children: [
                      {
                        type: 'svg',
                        props: {
                          viewBox: '0 0 24 24',
                          width: '44',
                          height: '44',
                          fill: 'none',
                          children: [
                            {
                              type: 'path',
                              props: {
                                d: 'M16 5 L8 12 L16 19',
                                stroke: INK,
                                strokeWidth: '3.4',
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                fill: 'none',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Fraunces',
                      fontWeight: 500,
                      fontSize: '36px',
                      color: PAPER,
                      display: 'flex',
                    },
                    children: 'Win/Loss Research',
                  },
                },
              ],
            },
          },
          // -- Bottom block: section label (kicker) + title --
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '20px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: GOLD,
                            display: 'flex',
                          },
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontFamily: 'IBM Plex Mono',
                            fontWeight: 400,
                            fontSize: '20px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: MUTED,
                            display: 'flex',
                          },
                          children: sectionLabel || SITE_NAME,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Fraunces',
                      fontWeight: 500,
                      fontSize: '52px',
                      lineHeight: 1.2,
                      color: PAPER,
                      maxWidth: '1000px',
                      display: 'flex',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
        ],
      },
    } as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Fraunces', data: fraunces500, weight: 500, style: 'normal' },
        { name: 'IBM Plex Mono', data: plexMono400, weight: 400, style: 'normal' },
      ],
    }
  );

  const pngArrayBuffer = await imageResponse.arrayBuffer();
  const jpegBuffer = await sharp(Buffer.from(pngArrayBuffer))
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toBuffer();

  return new Response(new Uint8Array(jpegBuffer), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
