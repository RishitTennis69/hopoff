import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PillButton } from '@/components/PillButton';
import { SaveToast } from '@/components/SaveToast';
import { SearchBar } from '@/components/SearchBar';
import { VideoCard } from '@/components/VideoCard';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { searchVideos, type VideoItem } from '@/data/mock';
import { useShareFeedbackStore } from '@/store/shareFeedbackStore';
import { useVideoStore } from '@/store/videoStore';
import { enrichVideoMetadata } from '@/utils/videoMetadata';
import { formatSavedLabel } from '@/utils/savedLabel';
import { searchYouTube } from '@/utils/youtube';
import { colors, fonts, glass, radii, spacing } from '@/theme';

function ShareArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={colors.textMuted}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ShareNote() {
  return (
    <GlassCard style={{ marginTop: spacing.xxl, gap: spacing.md }}>
      <AppText variant="subheading" color={colors.text}>
        See it on TikTok or Instagram?
      </AppText>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <AppIcon brandKey="tiktok" size={40} />
        <AppIcon brandKey="instagram" size={40} />
        <ShareArrow />
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.text,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontFamily: fonts.extraBold, fontSize: 16, color: colors.bg }}>
            H
          </AppText>
        </View>
      </View>

      <AppText variant="caption" color={colors.textMuted} center>
        Share · Pick HopOff · Saved
      </AppText>
    </GlassCard>
  );
}

// ─── search select mode ────────────────────────────────────────────────────

type Mode = 'library' | 'searching' | 'select';

export type SelectModeState = {
  active: boolean;
  selectedCount: number;
  confirm: () => void;
};

type Props = {
  onSelectModeChange?: (state: SelectModeState) => void;
};

export function CollectionManager({ onSelectModeChange }: Props = {}) {
  const [width, setWidth] = useState(0);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VideoItem[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [mode, setMode] = useState<Mode>('library');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [playing, setPlaying] = useState<VideoItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { online } = useNetworkStatus();
  const { added, addVideo, addMany, removeVideo, isAdded, updateVideo } = useVideoStore();
  const shareFlashId = useShareFeedbackStore((s) => s.flashVideoId);
  const clearShareFeedback = useShareFeedbackStore((s) => s.clear);
  const enrichedLinkIds = useRef(new Set<string>());

  useEffect(() => {
    const generic = /^(Instagram|TikTok)\s+(reel|clip|post|video)/i;
    for (const v of added) {
      if (v.kind !== 'link' || !v.videoUrl || enrichedLinkIds.current.has(v.id)) continue;
      const needsMeta = !v.thumbnailUrl || generic.test(v.title) || !v.author;
      if (!needsMeta) continue;
      enrichedLinkIds.current.add(v.id);
      enrichVideoMetadata(v).then((enriched) => updateVideo(enriched));
    }
  }, [added, updateVideo]);

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    if (!q) {
      setResults(null);
      setFetching(false);
      return;
    }
    setFetching(true);
    setSearchError(null);
    searchYouTube(q).then((r) => {
      if (!cancelled) {
        if (!r.ok) {
          setSearchError(
            r.code === 'quota_exceeded'
              ? 'YouTube search quota exceeded. Try again tomorrow or use offline samples.'
              : r.error,
          );
          setResults(searchVideos(q));
          setMode('select');
        } else {
          setResults(r.items);
          setMode('select');
          if (r.fromFallback && !online) {
            setSearchError('You\u2019re offline — showing saved sample results.');
          }
        }
        setSelected(new Set());
        setFetching(false);
      }
    });
    return () => { cancelled = true; };
  }, [query]);

  const gap = spacing.md;
  const minCardW = 128;
  const cols = width >= minCardW * 2 + gap ? 2 : width > 0 ? 1 : 0;
  const cardW = cols > 0 ? Math.floor((width - gap * (cols - 1)) / cols) : 0;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    if (!shareFlashId) return;
    setFlashId(shareFlashId);
    const flashTimer = setTimeout(() => setFlashId(null), 1200);
    const clearTimer = setTimeout(clearShareFeedback, 2800);
    return () => {
      clearTimeout(flashTimer);
      clearTimeout(clearTimer);
    };
  }, [shareFlashId, clearShareFeedback]);

  // Library mode: toggle add/remove directly
  const handleLibraryToggle = (v: VideoItem) => {
    if (isAdded(v.id)) {
      removeVideo(v.id);
      showToast('Removed from library');
    } else {
      addVideo(v);
      setFlashId(v.id);
      setTimeout(() => setFlashId(null), 400);
      showToast(formatSavedLabel(v.title, v.source));
    }
  };

  // Select mode: toggle selection
  const handleSelectToggle = (v: VideoItem) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(v.id)) next.delete(v.id);
      else next.add(v.id);
      return next;
    });
  };

  const confirmSelection = useCallback(() => {
    const toAdd = (results ?? []).filter((v) => selected.has(v.id));
    if (toAdd.length > 0) {
      addMany(toAdd);
      showToast(
        toAdd.length === 1
          ? formatSavedLabel(toAdd[0].title, toAdd[0].source)
          : `Saved ${toAdd.length} videos`,
      );
    }
    setMode('library');
    setQuery('');
    setInput('');
    setResults(null);
    setSelected(new Set());
  }, [results, selected, addMany]);

  const cancelSearch = () => {
    setMode('library');
    setQuery('');
    setInput('');
    setResults(null);
    setSelected(new Set());
  };

  const triggerSearch = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMode('searching');
    setQuery(q);
  };

  const isSelectMode = mode === 'select';
  const shownVideos: VideoItem[] = isSelectMode ? results ?? [] : added;

  useEffect(() => {
    onSelectModeChange?.({
      active: isSelectMode,
      selectedCount: selected.size,
      confirm: confirmSelection,
    });
  }, [isSelectMode, selected.size, confirmSelection, onSelectModeChange]);

  return (
    <View>
      {!online && !isSelectMode && (
        <AppText variant="caption" color={colors.textMuted} style={{ marginBottom: spacing.sm }}>
          Offline — your library is still available. Search needs a connection.
        </AppText>
      )}

      {/* Header — select mode only */}
      {isSelectMode && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <AppText variant="subheading" style={{ flex: 1 }}>
            Select to add
          </AppText>
          <Pressable onPress={cancelSearch} hitSlop={8}>
            <AppText variant="small" color={colors.textMuted}>
              Cancel
            </AppText>
          </Pressable>
        </View>
      )}

      {!isSelectMode && (
        <View style={{ marginBottom: spacing.xs }}>
          <AppText variant="subheading" color={colors.text}>
            Add your own videos
          </AppText>
          <View style={{ marginTop: spacing.md }}>
            <SearchBar
            variant="dark"
            placeholder='Try "David Goggins"'
            value={input}
            onChangeText={setInput}
            onSubmit={triggerSearch}
            onClear={cancelSearch}
            activeSearch={!!query}
          />
          </View>
        </View>
      )}

      {toast ? <SaveToast message={toast} /> : null}

      {searchError && (
        <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.md }}>
          {searchError}
        </AppText>
      )}

      {fetching && (
        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <ActivityIndicator color={colors.text} />
        </View>
      )}

      {!fetching && isSelectMode && shownVideos.length === 0 && (
        <AppText variant="bodyRegular" color={colors.textMuted} style={{ marginTop: spacing.lg }}>
          No results. Try a different search.
        </AppText>
      )}

      {!isSelectMode && added.length === 0 && (
        <View
          style={{
            marginTop: spacing.lg,
            borderWidth: 1,
            borderColor: glass.border,
            borderRadius: radii.lg,
            paddingVertical: spacing.xl,
            paddingHorizontal: spacing.lg,
            alignItems: 'center',
          }}
        >
          <AppText variant="subheading" color={colors.text} center>
            Your library is empty
          </AppText>
          <AppText variant="caption" color={colors.textMuted} center style={{ marginTop: spacing.xs }}>
            Search YouTube above to save your first clip.
          </AppText>
        </View>
      )}

      {/* Video grid */}
      <View
        onLayout={onLayout}
        style={{
          width: '100%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
          marginTop: spacing.lg,
        }}
      >
        {cardW > 0 &&
          shownVideos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              width={cardW}
              variant="dark"
              mode={isSelectMode ? 'select' : 'add'}
              active={isSelectMode ? selected.has(v.id) : isAdded(v.id)}
              flashAdd={flashId === v.id}
              onPlay={() => {
                setPlaying(v);
                if (v.kind === 'link') {
                  enrichVideoMetadata(v).then((enriched) => {
                    updateVideo(enriched);
                    setPlaying(enriched);
                  });
                }
              }}
              onToggle={() => isSelectMode ? handleSelectToggle(v) : handleLibraryToggle(v)}
            />
          ))}
      </View>

      {/* Inline confirm only when parent isn't driving the footer */}
      {isSelectMode && !onSelectModeChange && (
        <Animated.View
          entering={FadeIn.duration(200)}
          style={{ marginTop: spacing.xl, marginBottom: spacing.xxxl }}
        >
          <PillButton
            label={
              selected.size === 0
                ? 'Done — no changes'
                : `Add ${selected.size} video${selected.size > 1 ? 's' : ''} to library`
            }
            onPress={confirmSelection}
          />
        </Animated.View>
      )}

      {!isSelectMode && <ShareNote />}

      <VideoPlayerModal video={playing} onClose={() => setPlaying(null)} />
    </View>
  );
}
