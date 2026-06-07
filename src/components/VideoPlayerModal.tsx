import { Linking, Modal, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppText } from './AppText';
import { MotivationVideo } from './MotivationVideo';
import { PillButton } from './PillButton';
import type { VideoItem } from '@/data/mock';
import { colors, radii, spacing } from '@/theme';

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <Pressable
      onPress={onClose}
      style={{ position: 'absolute', top: 48, right: spacing.xl, zIndex: 2, padding: 8 }}
    >
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Path d="M6 6l12 12M18 6L6 18" stroke={colors.text} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    </Pressable>
  );
}

function Caption({ video }: { video: VideoItem }) {
  return (
    <>
      <AppText variant="subheading" center style={{ marginTop: spacing.lg, paddingHorizontal: spacing.xl }}>
        {video.title}
      </AppText>
      <AppText variant="small" color={colors.textMuted} center style={{ marginTop: spacing.xs }}>
        {video.author}
      </AppText>
    </>
  );
}

function Mp4Player({ video }: { video: VideoItem }) {
  const player = useVideoPlayer(video.videoUrl, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  return (
    <View style={{ marginHorizontal: spacing.xl, borderRadius: radii.lg, overflow: 'hidden' }}>
      <VideoView
        player={player}
        style={{ width: '100%', aspectRatio: 9 / 16, maxHeight: 520 }}
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

function Body({ video }: { video: VideoItem }) {
  if (video.kind === 'youtube' && video.youtubeId) {
    return (
      <View style={{ marginHorizontal: spacing.xl }}>
        <MotivationVideo youtubeId={video.youtubeId} style={{ maxHeight: 520, alignSelf: 'center' }} />
      </View>
    );
  }

  if (video.kind === 'link') {
    return (
      <View style={{ marginHorizontal: spacing.xl, alignItems: 'center', gap: spacing.lg }}>
        <AppText variant="bodyRegular" color={colors.textMuted} center>
          This clip lives on {video.author}. Open it there to watch.
        </AppText>
        <PillButton label={`Open in ${video.author}`} onPress={() => Linking.openURL(video.videoUrl)} />
      </View>
    );
  }

  return <Mp4Player video={video} />;
}

type Props = {
  video: VideoItem | null;
  onClose: () => void;
};

export function VideoPlayerModal({ video, onClose }: Props) {
  return (
    <Modal visible={!!video} animationType="fade" transparent onRequestClose={onClose}>
      {video ? (
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center' }}>
          <CloseButton onClose={onClose} />
          <Body video={video} />
          <Caption video={video} />
        </View>
      ) : null}
    </Modal>
  );
}
