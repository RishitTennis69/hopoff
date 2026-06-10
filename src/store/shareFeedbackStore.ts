import { create } from 'zustand';
import type { BrandKey } from '@/data/mock';
import { formatSavedLabel } from '@/utils/savedLabel';

type ShareFeedbackState = {
  message: string | null;
  flashVideoId: string | null;
  showSuccess: (videoId: string, title: string, source?: BrandKey, author?: string) => void;
  clear: () => void;
};

export const useShareFeedbackStore = create<ShareFeedbackState>((set) => ({
  message: null,
  flashVideoId: null,
  showSuccess: (videoId, title, source, author) =>
    set({
      message: formatSavedLabel(title, source, author),
      flashVideoId: videoId,
    }),
  clear: () => set({ message: null, flashVideoId: null }),
}));
