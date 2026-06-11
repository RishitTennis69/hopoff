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

function youtubePlayerHtml(
  id: string,
  muted: boolean,
  loop: boolean,
  hideChrome: boolean,
  durationSec?: number,
) {
  const mute = muted ? 1 : 0;
  const loopFlag = loop ? 1 : 0;
  const controls = hideChrome ? 0 : 1;
  const strictWatch = hideChrome && !loop && durationSec && durationSec > 0 ? 1 : 0;
  const minWatchSec = strictWatch ? Math.max(1, Math.floor(durationSec! * 0.85)) : 0;
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; touch-action: none; }
    #player { width: 100%; height: 100%; background: #000; pointer-events: ${hideChrome ? 'none' : 'auto'}; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    var player;
    var maxTime = 0;
    var strict = ${strictWatch};
    var minWatch = ${minWatchSec};
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
            if (e.data === YT.PlayerState.ENDED) {
              if (strict && maxTime < minWatch) {
                player.seekTo(0);
                player.playVideo();
                return;
              }
              post('ended');
            }
          },
        },
      });
      if (strict) {
        setInterval(function() {
          if (!player || !player.getCurrentTime) return;
          var t = player.getCurrentTime();
          if (t > maxTime + 1.5) {
            player.seekTo(maxTime, true);
            return;
          }
          if (t > maxTime) maxTime = t;
        }, 400);
      }
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
        pointerEvents: hideChrome ? 'none' : 'auto',
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
  durationSec,
  onWatched,
}: {
  id: string;
  muted: boolean;
  loop: boolean;
  hideChrome: boolean;
  durationSec?: number;
  onWatched?: () => void;
}) {
  const blockTouches = hideChrome && !!onWatched && !loop;

  return (
    <WebView
      source={{
        html: youtubePlayerHtml(id, muted, loop, hideChrome, durationSec),
        baseUrl: APP_REFERER_ORIGIN,
      }}
      style={{ width: '100%', height: '100%', minHeight: 200, backgroundColor: '#000' }}
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
      pointerEvents={blockTouches ? 'none' : 'auto'}
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

  const strictBlock = hideChrome && !!onWatched && !loop;

  useEffect(() => {
    if (loop || !onWatched || strictBlock) return;
    const cap = durationSec && durationSec > 0 ? durationSec + 8 : 120;
    const t = setTimeout(fire, cap * 1000);
    return () => clearTimeout(t);
  }, [loop, onWatched, durationSec, strictBlock]);

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
      pointerEvents={strictBlock ? 'box-none' : 'auto'}
    >
      {Platform.OS === 'web' ? (
        <WebIframe id={youtubeId} radius={radius} muted={muted} loop={loop} hideChrome={hideChrome} />
      ) : (
        <NativeEmbed
          id={youtubeId}
          muted={muted}
          loop={loop}
          hideChrome={hideChrome}
          durationSec={durationSec}
          onWatched={onWatched ? fire : undefined}
        />
      )}
    </View>
  );
}
