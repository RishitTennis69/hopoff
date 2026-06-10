import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { useShareFeedbackStore } from '@/store/shareFeedbackStore';
import { useVideoStore } from '@/store/videoStore';
import { enrichVideoMetadata, extractShareUrl, videoFromShareUrl } from '@/utils/videoMetadata';

/**
 * Receives URLs shared into HopOff from TikTok / Instagram / YouTube via the
 * native share sheet and saves them to the library. Requires a dev build
 * (prebuild) — it is a no-op in Expo Go and on web.
 *
 * The video is added optimistically (so it appears at the top of the library
 * right away) and its title/thumbnail fill in once metadata resolves.
 */
export function useShareIntake() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent({
    resetOnBackground: false,
  });

  useEffect(() => {
    if (!hasShareIntent) return;

    const url = extractShareUrl(shareIntent.webUrl, shareIntent.text);
    const video = videoFromShareUrl(url);
    if (!video) {
      resetShareIntent();
      return;
    }

    const added = useVideoStore.getState().addVideoToTop({ ...video, pending: true });
    if (added) {
      router.push('/(tabs)/collection');
    }

    resetShareIntent();

    enrichVideoMetadata(video).then((enriched) => {
      useVideoStore.getState().updateVideo({ ...enriched, pending: false });
      if (added) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        useShareFeedbackStore
          .getState()
          .showSuccess(enriched.id, enriched.title, enriched.source, enriched.author);
      }
    });
  }, [hasShareIntent, shareIntent, resetShareIntent]);
}
