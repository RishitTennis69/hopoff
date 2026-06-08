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

    const added = useVideoStore.getState().addVideo(video);
    if (added) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      useShareFeedbackStore.getState().showSuccess(video.id, video.title);
      router.push('/(tabs)/collection');
    }

    resetShareIntent();

    enrichVideoMetadata(video).then((enriched) => {
      useVideoStore.getState().updateVideo(enriched);
      if (added) {
        useShareFeedbackStore.getState().showSuccess(enriched.id, enriched.title);
      }
    });
  }, [hasShareIntent, shareIntent, resetShareIntent]);
}
