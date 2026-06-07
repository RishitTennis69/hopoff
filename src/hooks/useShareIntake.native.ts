import { useEffect } from 'react';
import { useShareIntent } from 'expo-share-intent';
import { useVideoStore } from '@/store/videoStore';
import { videoFromUrl } from '@/utils/youtube';

/**
 * Receives URLs shared into HopOff from TikTok / Instagram / YouTube via the
 * native share sheet and saves them to the library. Requires a dev build
 * (prebuild) — it is a no-op in Expo Go and on web.
 */
export function useShareIntake(onAdded?: (title: string) => void) {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent({
    resetOnBackground: true,
  });

  useEffect(() => {
    if (!hasShareIntent) return;
    const url = shareIntent.webUrl ?? shareIntent.text ?? '';
    const video = videoFromUrl(url);
    if (video) {
      useVideoStore.getState().addVideo(video);
      onAdded?.(video.title);
    }
    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent, onAdded]);
}
