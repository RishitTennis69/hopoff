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
  muted?: boolean;
  loop?: boolean;
  onWatched?: () => void;
  /** Safety cap when the embed end event never fires. */
  durationSec?: number;
  /** Hide pause/title chrome on start (block overlay). */
  hideChrome?: boolean;
};

function youtubePlayerHtml(id: string, muted: boolean, loop: boolean, hideChrome: boolean) {
  const mute = muted ? 1 : 0;
  const loopFlag = loop ? 1 : 0;
  const controls = hideChrome ? 0 : 1;
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; background: #000; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    var player;
    function post(msg) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
    }
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        videoId: '${id}',
        playerVars: {
          autoplay: 1,
          mute: ${mute},
          controls: ${controls},
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          loop: ${loopFlag},
          playlist: '${id}',
          origin: '${APP_REFERER_ORIGIN}',
          disablekb: ${hideChrome ? 1 : 0},
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: function() { player.playVideo(); },
          onStateChange: function(e) {
            if (e.data === YT.PlayerState.ENDED) post('ended');
          },
        },
      });
    }
  </script>
</body>
</html>`;
}

function WebIframe({
  id,
  radius,
  muted,
  loop,
  hideChrome,
}: {
  id: string;
  radius: number;
  muted: boolean;
  loop: boolean;
  hideChrome: boolean;
}) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    controls: hideChrome ? '0' : '1',
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
    enablejsapi: '1',
    origin: APP_REFERER_ORIGIN,
    disablekb: hideChrome ? '1' : '0',
    fs: '0',
    iv_load_policy: '3',
  });
  if (loop) {
    params.set('loop', '1');
    params.set('playlist', id);
  }
  return (
    <iframe
      src={`https://www.youtube.com/embed/${id}?${params.toString()}`}
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
  hideChrome,
  onWatched,
}: {
  id: string;
  muted: boolean;
  loop: boolean;
  hideChrome: boolean;
  onWatched?: () => void;
}) {
  return (
    <WebView
      source={{ html: youtubePlayerHtml(id, muted, loop, hideChrome), baseUrl: APP_REFERER_ORIGIN }}
      style={{ flex: 1, width: '100%', height: '100%', backgroundColor: '#000' }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      androidLayerType="hardware"
      onMessage={(e) => {
        if (e.nativeEvent.data === 'ended') onWatched?.();
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
  hideChrome = false,
}: Props) {
  const fired = useRef(false);
  const fire = () => {
    if (fired.current || loop || !onWatched) return;
    fired.current = true;
    onWatched();
  };

  useEffect(() => {
    if (loop || !onWatched) return;
    const cap = durationSec && durationSec > 0 ? durationSec + 8 : 120;
    const t = setTimeout(fire, cap * 1000);
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
        !style?.height && !style?.width && { aspectRatio: 9 / 16 },
        style,
      ]}
    >
      {Platform.OS === 'web' ? (
        <WebIframe id={youtubeId} radius={radius} muted={muted} loop={loop} hideChrome={hideChrome} />
      ) : (
        <NativeEmbed
          id={youtubeId}
          muted={muted}
          loop={loop}
          hideChrome={hideChrome}
          onWatched={onWatched ? fire : undefined}
        />
      )}
    </View>
  );
}
