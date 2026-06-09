import { Image } from 'expo-image';
import { Linking, Modal, Pressable, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { MotivationVideo } from './MotivationVideo';
import { PillButton } from './PillButton';
import type { VideoItem } from '@/data/mock';
import { shortLinkTitle } from '@/utils/videoDisplay';
import { thumbnailSource } from '@/utils/videoThumbnail';
import { colors, glass, radii, spacing } from '@/theme';

/** Portrait thumb proportion used in `VideoCard` (height = width × 1.15). */
const THUMB_HEIGHT_RATIO = 1.15;

function libraryCardWidth(screenW: number): number {
  const gap = spacing.md;
  const gridW = screenW - spacing.xl * 2;
  return Math.floor((gridW - gap) / 2);
}

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

function Mp4Player({ video, width }: { video: VideoItem; width: number }) {
  const height = Math.round(width * THUMB_HEIGHT_RATIO);
  const player = useVideoPlayer(video.videoUrl, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  return (
    <View style={{ alignSelf: 'center', width, height, borderRadius: radii.lg, overflow: 'hidden' }}>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="cover"
        nativeControls
      />
    </View>
  );
}

function PlayBadge() {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Svg width={16} height={16} viewBox="0 0 24 24">
        <Path fill="#fff" d="M8 5v14l11-7z" />
      </Svg>
    </View>
  );
}

function LinkPreview({ video }: { video: VideoItem }) {
  const { width: screenW } = useWindowDimensions();
  const cardW = libraryCardWidth(screenW);
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
    <View style={{ alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl }}>
      <View
        style={{
          width: cardW,
          backgroundColor: glass.bg,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: glass.border,
          padding: spacing.sm,
        }}
      >
        <Pressable onPress={() => Linking.openURL(video.videoUrl)}>
          <View
            style={{
              width: '100%',
              aspectRatio: 1 / THUMB_HEIGHT_RATIO,
              borderRadius: radii.sm,
              backgroundColor: video.thumbnailUrl ? glass.bg : 'rgba(255,255,255,0.07)',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {video.thumbnailUrl ? (
              <Image
                source={thumbnailSource(video.thumbnailUrl, video.source)}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <AppIcon brandKey={video.source} size={48} />
            )}
            <PlayBadge />
          </View>
        </Pressable>
        <View style={{ marginTop: spacing.sm, gap: 4, paddingHorizontal: 2 }}>
          <AppText variant="small" color={colors.text} numberOfLines={2}>
            {title}
          </AppText>
          {author ? (
            <AppText variant="bodyRegular" color={colors.textMuted} numberOfLines={1} style={{ fontSize: 15 }}>
              {author}
            </AppText>
          ) : null}
        </View>
      </View>
      {platform ? (
        <View style={{ width: cardW }}>
          <PillButton
            label={`Open in ${platform}`}
            onPress={() => Linking.openURL(video.videoUrl)}
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}

function Body({ video }: { video: VideoItem }) {
  const { width: screenW } = useWindowDimensions();
  const cardW = libraryCardWidth(screenW);
  const videoH = Math.round(cardW * THUMB_HEIGHT_RATIO);

  if (video.kind === 'youtube' && video.youtubeId) {
    return (
      <View style={{ alignItems: 'center', paddingHorizontal: spacing.xl }}>
        <MotivationVideo
          youtubeId={video.youtubeId}
          muted={false}
          loop={false}
          style={{ width: cardW, height: videoH, alignSelf: 'center' }}
        />
      </View>
    );
  }

  if (video.kind === 'link') {
    return <LinkPreview video={video} />;
  }

  return <Mp4Player video={video} width={cardW} />;
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
