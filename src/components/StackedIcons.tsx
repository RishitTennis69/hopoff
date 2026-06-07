import { View } from 'react-native';
import { AppIcon } from './AppIcon';
import { getApp } from '@/data/mock';
import { colors } from '@/theme';

type Props = {
  appIds: string[];
  size?: number;
  max?: number;
};

export function StackedIcons({ appIds, size = 40, max = 3 }: Props) {
  const shown = appIds.slice(0, max);
  const overlap = size * 0.28;
  return (
    <View style={{ flexDirection: 'row', width: size + (shown.length - 1) * (size - overlap) }}>
      {shown.map((id, i) => {
        const app = getApp(id);
        if (!app) return null;
        return (
          <View
            key={id}
            style={{
              marginLeft: i === 0 ? 0 : -overlap,
              borderRadius: size * 0.28,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <AppIcon brandKey={app.brand} size={size} radius={size * 0.28} tight />
          </View>
        );
      })}
    </View>
  );
}
