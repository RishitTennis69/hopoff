/** Short caption for link-video player (no platform boilerplate). */
export function shortLinkTitle(title: string, author?: string, maxLen = 52): string {
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

  if (author && author !== 'Instagram' && author !== 'TikTok') {
    const authorRe = new RegExp(`^@?${author}\\s*[:\\-]?\\s*`, 'i');
    t = t.replace(authorRe, '').trim();
  }

  if (/^(instagram|tiktok)\s+(reel|clip|post|video)/i.test(t)) {
    return author && author !== 'Instagram' && author !== 'TikTok' ? author : 'Saved clip';
  }

  if (t.length > maxLen) {
    const cut = t.slice(0, maxLen - 1);
    const lastSpace = cut.lastIndexOf(' ');
    t = (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim() + '…';
  }

  return t || author || 'Saved clip';
}
