import { View, type ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SAMPLE_VIDEO_URL } from '@/data/mock';
import { colors, radii } from '@/theme';

type Props = {
  style?: ViewStyle;
  radius?: number;
  muted?: boolean;
};

export function VideoStage({ style, radius = radii.xl, muted = true }: Props) {
  const player = useVideoPlayer(SAMPLE_VIDEO_URL, (p) => {
    p.loop = true;
    p.muted = muted;
    p.play();
  });

  return (
    <View
      style={[
        { backgroundColor: colors.card, borderRadius: radius, overflow: 'hidden' },
        style,
      ]}
    >
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}
