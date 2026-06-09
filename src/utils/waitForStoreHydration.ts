import { useVideoStore } from '@/store/videoStore';

/** Wait until persisted video library has loaded (required on cold-start share). */
export function waitForVideoStoreHydration(): Promise<void> {
  return new Promise((resolve) => {
    if (useVideoStore.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsub = useVideoStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}
