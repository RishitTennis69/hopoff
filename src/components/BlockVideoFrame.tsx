import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MotivationVideo } from './MotivationVideo';
import { DEFAULT_LIBRARY, WELCOME_YOUTUBE_ID, type VideoItem } from '@/data/mock';
import { useVideoStore } from '@/store/videoStore';
import { parseDurationLabel } from '@/utils/timeSaved';
import { isUnderMinute } from '@/utils/videoDuration';
import { colors, radii } from '@/theme';

function pickVideo(library: VideoItem[]): VideoItem {
  const eligible = library.filter((v) => isUnderMinute(v.duration));
  const fromLib = eligible.find((v) => v.youtubeId) ?? eligible[0];
  const fallback = DEFAULT_LIBRARY.find((v) => isUnderMinute(v.duration)) ?? DEFAULT_LIBRARY[0];
  return (
    fromLib ??
    fallback ?? {
      id: 'fallback',
      title: '',
      author: '',
      source: 'youtube',
      accent: '',
      duration: '0:45',
      videoUrl: '',
      kind: 'youtube',
      youtubeId: WELCOME_YOUTUBE_ID,
    }
  );
}

function Mp4Frame({ video, onWatched }: { video: VideoItem; onWatched: () => void }) {
  const player = useVideoPlayer(video.videoUrl, (p) => {
    p.loop = false;
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener('playToEnd', onWatched);
    return () => sub.remove();
  }, [player, onWatched]);

  return (
    <VideoView
      player={player}
      style={{ width: '100%', aspectRatio: 9 / 16 }}
      contentFit="cover"
      nativeControls
    />
  );
}

type Props = {
  onWatched: (durationSec: number) => void;
};

export function BlockVideoFrame({ onWatched }: Props) {
  const library = useVideoStore((s) => s.added);
  const video = useMemo(() => pickVideo(library), [library]);
  const durationSec = useMemo(() => parseDurationLabel(video.duration), [video.duration]);
  const handleWatched = () => onWatched(durationSec > 0 ? durationSec : 57);

  return (
    <View
      style={{
        alignSelf: 'center',
        width: '88%',
        maxWidth: 360,
        backgroundColor: colors.card,
        borderRadius: radii.xl,
        overflow: 'hidden',
      }}
    >
      {video.kind === 'youtube' && video.youtubeId ? (
        <MotivationVideo
          youtubeId={video.youtubeId}
          muted={false}
          loop={false}
          radius={radii.xl}
          durationSec={durationSec > 0 ? durationSec : undefined}
          onWatched={handleWatched}
        />
      ) : video.videoUrl ? (
        <Mp4Frame video={video} onWatched={handleWatched} />
      ) : (
        <MotivationVideo
          youtubeId={WELCOME_YOUTUBE_ID}
          muted={false}
          loop={false}
          radius={radii.xl}
          durationSec={57}
          onWatched={handleWatched}
        />
      )}
    </View>
  );
}
