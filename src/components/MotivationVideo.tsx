import { Platform, View, type ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
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
};

function embedUrl(id: string, muted: boolean, loop: boolean) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    controls: '1',
    playsinline: '1',
    modestbranding: '1',
    rel: '0',
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

function NativeEmbed({ id, muted, loop }: { id: string; muted: boolean; loop: boolean }) {
  const html = `<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#000;overflow:hidden">
<iframe
  width="100%" height="100%"
  src="${embedUrl(id, muted, loop)}"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
</body></html>`;

  return (
    <WebView
      source={{ html }}
      style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      scrollEnabled={false}
    />
  );
}

export function MotivationVideo({
  style,
  youtubeId = WELCOME_YOUTUBE_ID,
  radius = radii.lg,
  muted = true,
  loop = true,
}: Props) {
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
        <NativeEmbed id={youtubeId} muted={muted} loop={loop} />
      )}
    </View>
  );
}
