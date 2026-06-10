import type { VercelRequest, VercelResponse } from '@vercel/node';
import { applyCors } from './_cors';

type OEmbed = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
  description?: string;
};

const UA =
  'Mozilla/5.0 (compatible; HopOff/1.0; +https://hopoff.app) facebookexternalhit/1.1';

async function tryOEmbed(endpoint: string, pageUrl: string): Promise<OEmbed | null> {
  const res = await fetch(`${endpoint}?url=${encodeURIComponent(pageUrl)}&format=json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as OEmbed;
  if (!data.title && !data.author_name && !data.thumbnail_url) return null;
  return data;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function absolutizeUrl(base: string, maybeRelative?: string): string | undefined {
  if (!maybeRelative) return undefined;
  if (maybeRelative.startsWith('http')) return maybeRelative;
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

function meta(html: string, prop: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const m = html.match(re);
  if (m?.[1]) return m[1].trim();
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`,
    'i',
  );
  return re2.exec(html)?.[1]?.trim();
}

function parseInstagramOg(ogTitle: string, ogDescription: string): { title: string; author_name?: string } {
  const titleRaw = decodeEntities(ogTitle);
  const descRaw = decodeEntities(ogDescription);

  const onInsta = titleRaw.match(/^(.+?)\s+on Instagram(?::\s*(.+))?$/i);
  if (onInsta) {
    const who = onInsta[1].trim();
    const handle = who.match(/\(@([^)]+)\)/);
    const author_name =
      handle?.[1] || who.replace(/^@/, '').replace(/\s*\(@[^)]+\)/, '').trim() || undefined;
    const captionFromTitle = onInsta[2]?.replace(/^["']|["']$/g, '').trim();

    // Prefer explicit caption after "on Instagram:"; fall back to description.
    const title = captionFromTitle || descRaw || who.replace(/\s*\(@[^)]+\)/, '').trim() || titleRaw;
    return { title, author_name };
  }

  if (descRaw && (!titleRaw || titleRaw.length < 8)) {
    return { title: descRaw };
  }

  return { title: titleRaw || descRaw, author_name: undefined };
}

/** Scrape Open Graph tags — works for many public Instagram/TikTok posts. */
async function scrapeOpenGraph(pageUrl: string): Promise<OEmbed | null> {
  const res = await fetch(pageUrl, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
    redirect: 'follow',
  });
  if (!res.ok) return null;
  const html = await res.text();
  const ogTitle = meta(html, 'og:title') ?? '';
  const ogDescription = meta(html, 'og:description') ?? '';
  const thumbnail_url = absolutizeUrl(pageUrl, meta(html, 'og:image'));

  const isInsta = /instagram\.com/i.test(pageUrl);
  let title = decodeEntities(ogTitle);
  let author_name = decodeEntities(meta(html, 'og:site_name') ?? '');

  if (isInsta) {
    const parsed = parseInstagramOg(ogTitle, ogDescription);
    title = parsed.title;
    author_name = parsed.author_name || author_name;
  } else if (!title && ogDescription) {
    title = decodeEntities(ogDescription);
  }

  if (!title && !thumbnail_url) return null;
  return {
    title: title || undefined,
    author_name: author_name || undefined,
    description: ogDescription ? decodeEntities(ogDescription) : undefined,
    thumbnail_url,
  };
}

/** GET /api/oembed?url= — server-side metadata for Instagram, TikTok, YouTube links. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  const pageUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  if (!pageUrl) return res.status(400).json({ error: 'Missing url parameter' });

  const isInsta = /instagram\.com/i.test(pageUrl);
  const isTikTok = /tiktok\.com/i.test(pageUrl);
  const isYouTube = /youtube\.com|youtu\.be/i.test(pageUrl);

  const endpoints: string[] = [];
  if (isYouTube) endpoints.push('https://www.youtube.com/oembed');
  if (isInsta) {
    endpoints.push('https://api.instagram.com/oembed', 'https://www.instagram.com/oembed');
  }
  if (isTikTok) endpoints.push('https://www.tiktok.com/oembed');
  endpoints.push('https://noembed.com/embed');

  for (const endpoint of endpoints) {
    try {
      const data = await tryOEmbed(endpoint, pageUrl);
      if (data) return res.status(200).json(data);
    } catch {
      /* next */
    }
  }

  if (isInsta || isTikTok) {
    try {
      const scraped = await scrapeOpenGraph(pageUrl);
      if (scraped) return res.status(200).json(scraped);
    } catch {
      /* fall through */
    }
  }

  return res.status(404).json({ error: 'Could not load preview for this link' });
}
