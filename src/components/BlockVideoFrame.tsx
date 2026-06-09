import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MotivationVideo } from './MotivationVideo';
import { DEFAULT_LIBRARY, type VideoItem } from '@/data/mock';
import { useVideoStore } from '@/store/videoStore';
import { parseDurationLabel } from '@/utils/timeSaved';
import { isUnderMinute } from '@/utils/videoDuration';
import { colors, radii } from '@/theme';

function fallbackVideo(): VideoItem {
  return DEFAULT_LIBRARY.find((v) => isUnderMinute(v.duration)) ?? DEFAULT_LIBRARY[0];
}

/** Random clip from the user's library (≤60s). New pick each time the overlay mounts. */
function pickRandomVideo(library: VideoItem[]): VideoItem {
  const eligible = library.filter((v) => isUnderMinute(v.duration));
  const pool = eligible.length
    ? eligible
    : DEFAULT_LIBRARY.filter((v) => isUnderMinute(v.duration));
  if (!pool.length) return fallbackVideo();
  return pool[Math.floor(Math.random() * pool.length)];
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
  const videoRef = useRef<VideoItem | null>(null);
  if (!videoRef.current) {
    videoRef.current = pickRandomVideo(library);
  }
  const video = videoRef.current;
  const durationSec = parseDurationLabel(video.duration);
  const fallbackSec = durationSec > 0 ? durationSec : 45;
  const handleWatched = () => onWatched(fallbackSec);

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
          hideChrome
          durationSec={durationSec > 0 ? durationSec : undefined}
          onWatched={handleWatched}
        />
      ) : video.videoUrl ? (
        <Mp4Frame video={video} onWatched={handleWatched} />
      ) : (
        <MotivationVideo
          youtubeId={DEFAULT_LIBRARY[0].youtubeId!}
          muted={false}
          loop={false}
          radius={radii.xl}
          hideChrome
          durationSec={durationSec > 0 ? durationSec : 45}
          onWatched={handleWatched}
        />
      )}
    </View>
  );
}
