import { View, type ViewStyle } from 'react-native';
import { AppText } from './AppText';

type Props = {
  children: string;
  center?: boolean;
  style?: ViewStyle;
};

/** Major screen heading — plain title typography, no effects. */
export function ScreenTitle({ children, center, style }: Props) {
  return (
    <View style={style}>
      <AppText variant="title" center={center}>
        {children}
      </AppText>
    </View>
  );
}
