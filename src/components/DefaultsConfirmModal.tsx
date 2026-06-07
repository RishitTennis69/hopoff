import { Modal, Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { GlassCard } from './GlassCard';
import { PillButton } from './PillButton';
import { colors, spacing } from '@/theme';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DefaultsConfirmModal({
  visible,
  title = 'Continue with defaults?',
  message,
  confirmLabel = 'Continue with defaults',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onCancel} />
        <View style={{ paddingHorizontal: spacing.xl }}>
          <GlassCard style={{ gap: spacing.lg }}>
            <AppText variant="title" style={{ fontSize: 22 }}>
              {title}
            </AppText>
            <AppText variant="bodyRegular" color={colors.textMuted}>
              {message}
            </AppText>
            <PillButton label={confirmLabel} onPress={onConfirm} />
            <PillButton label="Go back" variant="ghost" onPress={onCancel} />
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
}
