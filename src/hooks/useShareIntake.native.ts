import { useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { useShareFeedbackStore } from '@/store/shareFeedbackStore';
import { useVideoStore } from '@/store/videoStore';
import {
  enrichVideoMetadata,
  extractShareUrl,
  normalizeShareUrl,
  videoFromShareUrl,
} from '@/utils/videoMetadata';
import { waitForVideoStoreHydration } from '@/utils/waitForStoreHydration';

/**
 * Receives URLs shared into HopOff from TikTok / Instagram / YouTube via the
 * native share sheet and saves them to the library. Requires a dev build
 * (prebuild) — it is a no-op in Expo Go and on web.
 */
export function useShareIntake() {
  const { hasShareIntent, shareIntent, resetShareIntent, isReady } = useShareIntent({
    resetOnBackground: false,
  });
  const processingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady || !hasShareIntent) return;

    const url = extractShareUrl(shareIntent.webUrl, shareIntent.text);
    if (!url) {
      resetShareIntent();
      return;
    }

    const key = normalizeShareUrl(url);
    if (processingRef.current === key) return;

    const draft = videoFromShareUrl(url);
    if (!draft) {
      resetShareIntent();
      return;
    }

    processingRef.current = key;

    void (async () => {
      try {
        await waitForVideoStoreHydration();
        const enriched = await enrichVideoMetadata(draft);
        const { addVideo, updateVideo, isAdded } = useVideoStore.getState();
        const added = addVideo(enriched);

        if (!added && isAdded(enriched.id)) {
          updateVideo(enriched);
        }

        if (added || isAdded(enriched.id)) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          useShareFeedbackStore.getState().showSuccess(enriched.id, enriched.title, enriched.source);
          router.replace('/(tabs)/collection');
        }
      } finally {
        processingRef.current = null;
        resetShareIntent();
      }
    })();
  }, [isReady, hasShareIntent, shareIntent, resetShareIntent]);
}
