import { Image } from 'expo-image';
import { Linking, Modal, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { MotivationVideo } from './MotivationVideo';
import { PillButton } from './PillButton';
import type { VideoItem } from '@/data/mock';
import { shortLinkTitle } from '@/utils/videoDisplay';
import { thumbnailSource } from '@/utils/videoThumbnail';
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

function LinkPreview({ video }: { video: VideoItem }) {
  const platform =
    video.source === 'instagram' || video.source === 'instagramReels'
      ? 'Instagram'
      : video.source === 'tiktok'
        ? 'TikTok'
        : null;
  const title = shortLinkTitle(video.title, video.author, 80);
  const author =
    video.author && video.author !== 'Instagram' && video.author !== 'TikTok' ? video.author : null;

  return (
    <View style={{ marginHorizontal: spacing.xl, alignItems: 'center', gap: spacing.md }}>
      <Pressable onPress={() => Linking.openURL(video.videoUrl)}>
        <View
          style={{
            width: '100%',
            aspectRatio: 9 / 16,
            maxHeight: 400,
            borderRadius: radii.lg,
            overflow: 'hidden',
            backgroundColor: video.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {video.thumbnailUrl ? (
            <Image
              source={thumbnailSource(video.thumbnailUrl, video.source)}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <AppIcon brandKey={video.source} size={72} />
          )}
        </View>
      </Pressable>
      <AppText variant="subheading" center style={{ paddingHorizontal: spacing.md }}>
        {title}
      </AppText>
      {author ? (
        <AppText variant="caption" color={colors.textMuted} center>
          {author}
        </AppText>
      ) : null}
      {platform ? (
        <PillButton
          label={`Open in ${platform}`}
          onPress={() => Linking.openURL(video.videoUrl)}
          fullWidth
        />
      ) : null}
    </View>
  );
}

function Body({ video }: { video: VideoItem }) {
  if (video.kind === 'youtube' && video.youtubeId) {
    return (
      <View style={{ marginHorizontal: spacing.xl }}>
        <MotivationVideo
          youtubeId={video.youtubeId}
          muted={false}
          loop={false}
          style={{ maxHeight: 520, alignSelf: 'center' }}
        />
      </View>
    );
  }

  if (video.kind === 'link') {
    return <LinkPreview video={video} />;
  }

  return <Mp4Player video={video} />;
}

type Props = {
  video: VideoItem | null;
  onClose: () => void;
};

export function VideoPlayerModal({ video, onClose }: Props) {
  const isLink = video?.kind === 'link';

  return (
    <Modal visible={!!video} animationType="fade" transparent onRequestClose={onClose}>
      {video ? (
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center' }}>
          <CloseButton onClose={onClose} />
          <View style={{ paddingVertical: spacing.xxxl }}>
            <Body video={video} />
            {!isLink ? (
              <View style={{ marginTop: spacing.lg, paddingHorizontal: spacing.xl }}>
                <AppText variant="subheading" center>
                  {video.title}
                </AppText>
                <AppText variant="small" color={colors.textMuted} center style={{ marginTop: spacing.xs }}>
                  {video.author}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </Modal>
  );
}
