import { ReactNode } from 'react';
import { Modal, Pressable, View, type ViewStyle } from 'react-native';
import { popup } from '@/theme/popup';
import { radii, spacing } from '@/theme';

type ShellProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function PopupPanel({ children, style }: ShellProps) {
  return (
    <View
      style={[
        {
          backgroundColor: popup.surface,
          borderRadius: radii.xl,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

type ModalProps = {
  visible: boolean;
  children: ReactNode;
  onRequestClose?: () => void;
  dismissable?: boolean;
};

/** Full-screen modal with light scrim + off-white panel. */
export function PopupModal({ visible, children, onRequestClose, dismissable = true }: ModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onRequestClose ?? (() => {})}
    >
      <View style={{ flex: 1, backgroundColor: popup.scrim, justifyContent: 'center' }}>
        {dismissable && onRequestClose ? (
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onRequestClose}
          />
        ) : null}
        <View style={{ paddingHorizontal: spacing.xl }}>{children}</View>
      </View>
    </Modal>
  );
}
