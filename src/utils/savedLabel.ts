import type { BrandKey } from '@/data/mock';
import { shortLinkTitle } from '@/utils/videoDisplay';

const GENERIC_TITLES =
  /^(youtube|instagram|tiktok)(\s+(video|clip|reel|post|shorts?))?$/i;

/** Confirmation toast: Saved "Title". */
export function formatSavedLabel(title: string, source?: BrandKey, author?: string): string {
  const display = shortLinkTitle(title, author, 48);

  if (!display || GENERIC_TITLES.test(display)) {
    if (source === 'instagram' || source === 'instagramReels') return 'Saved "Instagram reel"';
    if (source === 'tiktok') return 'Saved "TikTok clip"';
    if (source === 'youtube' || source === 'youtubeShorts') return 'Saved "YouTube video"';
    return 'Saved video';
  }

  return `Saved "${display}"`;
}
