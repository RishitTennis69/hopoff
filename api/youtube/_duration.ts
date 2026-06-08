/** Parse ISO 8601 duration (e.g. PT1M32S) to seconds. */
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

/** Fetch durations for video ids; returns map id → seconds. */
export async function fetchVideoDurations(
  ids: string[],
  apiKey: string,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (!ids.length) return out;

  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));

  for (const chunk of chunks) {
    const params = new URLSearchParams({
      part: 'contentDetails',
      id: chunk.join(','),
      key: apiKey,
    });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) continue;
    for (const item of (data.items ?? []) as ContentDetailsItem[]) {
      const dur = item.contentDetails?.duration;
      if (dur) out.set(item.id, parseIsoDuration(dur));
    }
  }
  return out;
}
