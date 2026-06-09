import { useEffect } from 'react';
import { InteractionManager } from 'react-native';
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
    const draft = videoFromShareUrl(url);
    if (!draft) {
      resetShareIntent();
      return;
    }

    resetShareIntent();

    void (async () => {
      const enriched = await enrichVideoMetadata(draft);
      const added = useVideoStore.getState().addVideo(enriched);
      if (!added) return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(tabs)/collection');
      InteractionManager.runAfterInteractions(() => {
        useShareFeedbackStore.getState().showSuccess(enriched.id, enriched.title, enriched.source);
      });
    })();
  }, [hasShareIntent, shareIntent, resetShareIntent]);
}
