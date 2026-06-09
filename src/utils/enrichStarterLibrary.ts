import { DEFAULT_LIBRARY } from '@/data/mock';
import { useVideoStore } from '@/store/videoStore';
import { durationSecFromLabel } from '@/utils/videoDuration';
import { enrichVideoMetadata, attachYouTubeDuration } from '@/utils/videoMetadata';
import { fetchYouTubeDurations, formatDuration } from '@/utils/youtubeDuration';

const PLACEHOLDER_TITLES = new Set(['Motivation clip', 'YouTube video', '']);

/** Refresh starter YouTube titles, durations, and thumbnails in the saved library. */
export async function enrichStarterLibrary(): Promise<void> {
  const { added, updateVideo } = useVideoStore.getState();

  const ytIds = DEFAULT_LIBRARY.map((d) => d.youtubeId).filter((id): id is string => !!id);
  const durationMap = await fetchYouTubeDurations(ytIds);

  for (const def of DEFAULT_LIBRARY) {
    const inLib = added.find((v) => v.id === def.id || v.youtubeId === def.youtubeId);
    if (!inLib) continue;

    const apiSec = def.youtubeId ? durationMap.get(def.youtubeId) : undefined;
    const defSec = apiSec ?? durationSecFromLabel(def.duration);
    const libSec = durationSecFromLabel(inLib.duration);
    const durationWrong = defSec > 0 && libSec !== defSec;

    const needsMeta =
      PLACEHOLDER_TITLES.has(inLib.title) ||
      inLib.author === 'YouTube' ||
      !inLib.thumbnailUrl ||
      inLib.title === def.title ||
      durationWrong;

    if (!needsMeta) continue;

    let enriched = await enrichVideoMetadata({ ...def, ...inLib });
    if (apiSec && apiSec > 0) {
      enriched = await attachYouTubeDuration(enriched, apiSec);
    } else if (defSec > 0 && durationWrong) {
      enriched = { ...enriched, duration: formatDuration(defSec) };
    }
    updateVideo(enriched);
  }
}
