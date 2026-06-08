import { create } from 'zustand';

type ShareFeedbackState = {
  message: string | null;
  flashVideoId: string | null;
  showSuccess: (videoId: string, title: string) => void;
  clear: () => void;
};

export const useShareFeedbackStore = create<ShareFeedbackState>((set) => ({
  message: null,
  flashVideoId: null,
  showSuccess: (videoId, title) =>
    set({
      message: `Saved — ${title}`,
      flashVideoId: videoId,
    }),
  clear: () => set({ message: null, flashVideoId: null }),
}));
