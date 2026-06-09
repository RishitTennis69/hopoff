import { useEffect } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SaveToast } from '@/components/SaveToast';
import { useShareFeedbackStore } from '@/store/shareFeedbackStore';
import { spacing } from '@/theme';

/** Global save confirmation after share-sheet import (visible on any tab). */
export function ShareFeedbackToast() {
  const insets = useSafeAreaInsets();
  const message = useShareFeedbackStore((s) => s.message);
  const clear = useShareFeedbackStore((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 3500);
    return () => clearTimeout(t);
  }, [message, clear]);

  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + spacing.sm,
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 9999,
        elevation: 9999,
        alignItems: 'center',
      }}
    >
      <SaveToast message={message} />
    </View>
  );
}
