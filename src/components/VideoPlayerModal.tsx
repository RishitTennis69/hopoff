import { Image } from 'expo-image';
import { ActivityIndicator, Linking, Modal, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { MotivationVideo } from './MotivationVideo';
import { PillButton } from './PillButton';
import type { VideoItem } from '@/data/mock';
import { linkAuthorName, shortLinkTitle } from '@/utils/videoDisplay';
import { thumbnailSource } from '@/utils/videoThumbnail';
import { colors, glass, radii, spacing } from '@/theme';

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
    <View
      style={{
        width: '100%',
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        borderRadius: radii.lg,
        overflow: 'hidden',
        alignSelf: 'center',
      }}
    >
      <VideoView
        player={player}
        style={{ width: '100%', aspectRatio: 9 / 16, maxHeight: 520 }}
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

function PlayBadge() {
  return (
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path fill="#fff" d="M8 5v14l11-7z" />
      </Svg>
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
  const author = linkAuthorName(video.author);

  return (
    <View style={{ marginHorizontal: spacing.xl, alignItems: 'center', gap: spacing.lg }}>
      <Pressable
        onPress={() => !video.pending && Linking.openURL(video.videoUrl)}
        style={{ width: '100%', alignItems: 'center' }}
        disabled={video.pending}
      >
        <View
          style={{
            width: '100%',
            aspectRatio: 9 / 16,
            maxHeight: 480,
            borderRadius: radii.lg,
            overflow: 'hidden',
            backgroundColor: video.thumbnailUrl ? glass.bg : 'rgba(255,255,255,0.07)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {video.pending ? (
            <ActivityIndicator color={colors.text} size="large" />
          ) : video.thumbnailUrl ? (
            <Image
              source={thumbnailSource(video.thumbnailUrl, video.source)}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <AppIcon brandKey={video.source} size={72} />
          )}
          {!video.pending ? <PlayBadge /> : null}
        </View>
      </Pressable>
      <View style={{ alignSelf: 'stretch', gap: spacing.xs, alignItems: 'center' }}>
        <AppText variant="subheading" center>
          {video.pending ? 'Video being added…' : title}
        </AppText>
        {!video.pending && author ? (
          <AppText variant="small" color={colors.textMuted} center>
            {author}
          </AppText>
        ) : null}
      </View>
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
      <View style={{ width: '100%', paddingHorizontal: spacing.xl, alignItems: 'center' }}>
        <MotivationVideo
          youtubeId={video.youtubeId}
          muted={false}
          loop={false}
          radius={radii.lg}
          style={{ width: '100%', maxHeight: 520, alignSelf: 'center' }}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)' }}>
          <CloseButton onClose={onClose} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.xxl }}>
            <View style={{ width: '100%', alignItems: 'center', transform: [{ translateY: -spacing.lg }] }}>
              <Body video={video} />
            </View>
            {!isLink ? (
              <View style={{ marginTop: spacing.lg, paddingHorizontal: spacing.xl, flexShrink: 0 }}>
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
