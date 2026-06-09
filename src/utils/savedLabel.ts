import type { BrandKey } from '@/data/mock';

const GENERIC_TITLES =
  /^(youtube|instagram|tiktok)(\s+(video|clip|reel|post|shorts?))?$/i;

/** Short confirmation line, e.g. "Saved David Goggins video". */
export function formatSavedLabel(title: string, source?: BrandKey): string {
  let subject = title.trim();

  subject = subject
    .replace(/\s*[-|•]\s*YouTube$/i, '')
    .replace(/\s*•\s*Instagram$/i, '')
    .replace(/\s+on Instagram:?\s*.*/i, '')
    .replace(/^@(\w+)\s*/i, '')
    .trim();

  if (!subject || GENERIC_TITLES.test(subject)) {
    if (source === 'instagram' || source === 'instagramReels') return 'Saved Instagram reel';
    if (source === 'tiktok') return 'Saved TikTok clip';
    if (source === 'youtube' || source === 'youtubeShorts') return 'Saved YouTube video';
    return 'Saved';
  }

  const beforeSeparator = subject.split(/\s[-|:]\s/)[0]?.trim();
  if (beforeSeparator && beforeSeparator.length <= 36) {
    subject = beforeSeparator;
  }

  if (subject.length > 28) {
    const words = subject.split(/\s+/);
    let short = '';
    for (const word of words) {
      const next = short ? `${short} ${word}` : word;
      if (next.length > 26) break;
      short = next;
    }
    subject = short || subject.slice(0, 26).trim();
  }

  return `Saved ${subject} video`;
}
