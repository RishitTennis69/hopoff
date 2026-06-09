import type { BrandKey } from '@/data/mock';

/** CDN thumbnails for social apps often need a Referer header. */
export function thumbnailSource(url: string, source?: BrandKey) {
  const needsInstagram =
    source === 'instagram' ||
    source === 'instagramReels' ||
    /instagram|fbcdn/i.test(url);
  const needsTikTok = source === 'tiktok' || /tiktok|tiktokcdn/i.test(url);

  if (needsInstagram) {
    return { uri: url, headers: { Referer: 'https://www.instagram.com/' } };
  }
  if (needsTikTok) {
    return { uri: url, headers: { Referer: 'https://www.tiktok.com/' } };
  }
  return { uri: url };
}
