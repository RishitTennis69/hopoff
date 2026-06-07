import { ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { colors } from '@/theme';

const PHONE_W = 390;

type Props = { children: ReactNode };

export function PhoneFrame({ children }: Props) {
  if (Platform.OS !== 'web') return <>{children}</>;

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: PHONE_W,
          backgroundColor: colors.bg,
          overflow: 'hidden',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}
