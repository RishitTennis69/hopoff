import { useEffect, useRef } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { APP_REFERER_ORIGIN } from '@/config/appId';
import { WELCOME_YOUTUBE_ID } from '@/data/mock';
import { radii } from '@/theme';

type Props = {
  style?: ViewStyle;
  youtubeId?: string;
  radius?: number;
  /** Default true for library previews; welcome screen passes false. */
  muted?: boolean;
  /** Default true; welcome screen passes false to play once. */
  loop?: boolean;
  /** Fires once when the clip ends or durationSec elapses. */
  onWatched?: () => void;
  /** Fallback watch length when embed end events are unavailable. */
  durationSec?: number;
};

function embedUrl(id: string, muted: boolean, loop: boolean) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    controls: '1',
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    enablejsapi: '1',
    origin: APP_REFERER_ORIGIN,
  });
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function WebIframe({ id, radius, muted, loop }: { id: string; radius: number; muted: boolean; loop: boolean }) {
  return (
    <iframe
      src={embedUrl(id, muted, loop)}
      title="Motivation"
      referrerPolicy="strict-origin-when-cross-origin"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: radius,
        backgroundColor: '#000',
      }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function NativeEmbed({
  id,
  muted,
  loop,
  onWatched,
}: {
  id: string;
  muted: boolean;
  loop: boolean;
  onWatched?: () => void;
}) {
  const fired = useRef(false);
  const fire = () => {
    if (fired.current || !onWatched) return;
    fired.current = true;
    onWatched();
  };

  const src = embedUrl(id, muted, loop);

  return (
    <WebView
      source={{
        uri: src,
        headers: { Referer: APP_REFERER_ORIGIN },
      }}
      style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      onMessage={(e) => {
        if (e.nativeEvent.data === 'ended') fire();
      }}
    />
  );
}

export function MotivationVideo({
  style,
  youtubeId = WELCOME_YOUTUBE_ID,
  radius = radii.lg,
  muted = true,
  loop = true,
  onWatched,
  durationSec,
}: Props) {
  const fired = useRef(false);
  const fire = () => {
    if (fired.current || loop || !onWatched) return;
    fired.current = true;
    onWatched();
  };

  useEffect(() => {
    if (loop || !onWatched || !durationSec || durationSec <= 0) return;
    const t = setTimeout(fire, durationSec * 1000);
    return () => clearTimeout(t);
  }, [loop, onWatched, durationSec]);

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: '#000',
          width: '100%',
        },
        !style?.height && { aspectRatio: 9 / 16 },
        style,
      ]}
    >
      {Platform.OS === 'web' ? (
        <WebIframe id={youtubeId} radius={radius} muted={muted} loop={loop} />
      ) : (
        <NativeEmbed id={youtubeId} muted={muted} loop={loop} onWatched={onWatched ? fire : undefined} />
      )}
    </View>
  );
}
