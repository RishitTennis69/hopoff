import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/theme';

/** Dark scrim + direct child content (use PopupPanel inside). */
export function PopupBackdrop({
  children,
  dismissable = true,
}: {
  children: ReactNode;
  dismissable?: boolean;
}) {
  const router = useRouter();
  const dismiss = () => dismissable && router.canGoBack() && router.back();
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center' }}>
      <Pressable
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={dismiss}
      />
      <View style={{ paddingHorizontal: spacing.xl }} pointerEvents="box-none">
        <View pointerEvents="auto">{children}</View>
      </View>
    </View>
  );
}
