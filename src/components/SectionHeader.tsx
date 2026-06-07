import { View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '@/theme';

type Props = {
  title: string;
  marginTop?: number;
  marginBottom?: number;
};

export function SectionHeader({ title, marginTop = spacing.xl, marginBottom = spacing.md }: Props) {
  return (
    <View style={{ marginTop, marginBottom }}>
      <AppText variant="heading">{title}</AppText>
    </View>
  );
}
