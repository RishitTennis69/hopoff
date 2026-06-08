export function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0);
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type ContentDetailsItem = { id: string; contentDetails?: { duration?: string } };

export async function fetchVideoDurationsDirect(
  ids: string[],
  apiKey: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (!ids.length) return out;

  const params = new URLSearchParams({
    part: 'contentDetails',
    id: ids.slice(0, 50).join(','),
    key: apiKey,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) return out;
  for (const item of (data.items ?? []) as ContentDetailsItem[]) {
    const dur = item.contentDetails?.duration;
    if (dur) out.set(item.id, parseIsoDuration(dur));
  }
  return out;
}
