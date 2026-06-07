import { ReactNode } from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
  padded?: boolean;
};

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'bottom'],
  contentStyle,
  padded = true,
}: Props) {
  const padding = padded ? spacing.xl : 0;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={edges}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ padding, paddingBottom: spacing.xxxl }, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, padding }, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
