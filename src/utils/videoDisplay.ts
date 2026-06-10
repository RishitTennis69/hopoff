/** Decode HTML entities that show up in scraped social titles. */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#0*39;|&#x0*27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#0*([0-9]+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Strip hashtags and stray &/# symbols so scraped captions read cleanly. */
export function scrubSocialText(raw: string): string {
  return decodeEntities(raw)
    .replace(/#[\p{L}\p{N}_]+/gu, ' ')
    .replace(/[#&]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Short caption for link-video player (no platform boilerplate). */
export function shortLinkTitle(title: string, author?: string, maxLen = 38): string {
  let t = title.trim();

  const onInsta = t.match(/^(.+?)\s+on Instagram:\s*['"]?(.+?)['"]?\s*$/i);
  if (onInsta) {
    t = onInsta[2].trim() || onInsta[1].trim();
  }

  t = t
    .replace(/\s*•\s*Instagram$/i, '')
    .replace(/\s+on Instagram:?\s*/i, '')
    .replace(/^['"]|['"]$/g, '')
    .trim();

  t = scrubSocialText(t);

  if (author && author !== 'Instagram' && author !== 'TikTok') {
    const handle = author.replace(/^@/, '').trim();
    if (handle) {
      const h = escapeRegExp(handle);
      t = t
        .replace(new RegExp(`^@?${h}\\s*[:\\-–—|]?\\s*`, 'i'), '')
        .replace(new RegExp(`\\s*[-–—|]\\s*@?${h}\\s*$`, 'i'), '')
        .replace(new RegExp(`\\s+by\\s+@?${h}\\s*$`, 'i'), '')
        .trim();
    }
  }

  if (/^(instagram|tiktok)\s+(reel|clip|post|video)/i.test(t)) {
    return author && author !== 'Instagram' && author !== 'TikTok' ? author : 'Saved clip';
  }

  if (t.length > maxLen) {
    const cut = t.slice(0, maxLen - 1);
    const lastSpace = cut.lastIndexOf(' ');
    t = `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim()}…`;
  }

  if (t) return t;
  if (author && author !== 'Instagram' && author !== 'TikTok') return 'Saved clip';
  return author || 'Saved clip';
}

/** Creator handle/name for link cards (excludes platform placeholders). */
export function linkAuthorName(author?: string): string | undefined {
  if (!author || author === 'Instagram' || author === 'TikTok') return undefined;
  const name = author.replace(/^@/, '').trim();
  return name || undefined;
}
