import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { radii } from '@/theme';

function instagramEmbedUrl(pageUrl: string): string | null {
  const m = pageUrl.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (!m) return null;
  return `https://www.instagram.com/${m[1]}/${m[2]}/embed/captioned/?cr=1`;
}

function tiktokEmbedUrl(pageUrl: string): string | null {
  const m = pageUrl.match(/\/video\/(\d+)/i);
  if (m?.[1]) return `https://www.tiktok.com/embed/v2/${m[1]}`;
  return null;
}

function embedHtml(embedUrl: string, platform: 'instagram' | 'tiktok') {
  const cropTop = platform === 'instagram' ? 48 : 0;
  const cropBottom = platform === 'instagram' ? 320 : 120;
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  .frame { width: 100%; height: 100%; overflow: hidden; position: relative; background: #000; }
  iframe {
    position: absolute;
    top: -${cropTop}px;
    left: 0;
    width: 100%;
    height: calc(100% + ${cropTop + cropBottom}px);
    border: 0;
    background: #000;
  }
</style>
</head>
<body>
  <div class="frame">
    <iframe
      src="${embedUrl}"
      allow="autoplay; encrypted-media; fullscreen"
      allowfullscreen
      scrolling="no"
    ></iframe>
  </div>
</body>
</html>`;
}

type Props = {
  videoUrl: string;
  source: 'instagram' | 'tiktok';
};

export function LinkEmbedVideo({ videoUrl, source }: Props) {
  const embed =
    source === 'instagram' ? instagramEmbedUrl(videoUrl) : tiktokEmbedUrl(videoUrl);
  if (!embed) return null;

  return (
    <View
      style={{
        width: '100%',
        aspectRatio: 9 / 16,
        maxHeight: 520,
        borderRadius: radii.lg,
        overflow: 'hidden',
        backgroundColor: '#000',
        alignSelf: 'center',
      }}
    >
      <WebView
        source={{ html: embedHtml(embed, source), baseUrl: 'https://hopoff.app' }}
        style={{ flex: 1, backgroundColor: '#000' }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        originWhitelist={['*']}
      />
    </View>
  );
}
