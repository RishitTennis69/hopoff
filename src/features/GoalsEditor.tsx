import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View, TextInput } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PillButton } from '@/components/PillButton';
import { getConnectServicesForPlatform } from '@/data/connectServices';
import type { ConnectService } from '@/data/mock';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useGoalsStore } from '@/store/goalsStore';
import { polishGoalsWithAi } from '@/utils/ai';
import {
  connectNotion,
  fetchNotionDatabases,
  openGoogleTasks,
  openShortcut,
  syncGoalsFromNotion,
} from '@/utils/connect';
import { colors, glass, fonts, radii, spacing } from '@/theme';

function ConnectRow({
  service,
  connected,
  busy,
  onPress,
}: {
  service: ConnectService;
  connected: boolean;
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={({ pressed, hovered }) => ({ opacity: pressed ? 0.85 : hovered ? 0.95 : 1 })}
    >
      <GlassCard
        selected={connected}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
        }}
      >
        <AppIcon brandKey={service.brand} size={38} />
        <AppText variant="subheading" color={colors.text} style={{ flex: 1 }}>
          {service.name}
        </AppText>
        {busy ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : connected ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path d="M20 6L9 17l-5-5" stroke={colors.text} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
            <AppText variant="small" color={colors.text}>
              Connected
            </AppText>
          </View>
        ) : (
          <AppText variant="small" color={colors.textMuted}>
            Connect
          </AppText>
        )}
      </GlassCard>
    </Pressable>
  );
}

function MicIcon({ active }: { active: boolean }) {
  const c = active ? colors.bg : colors.textMuted;
  const fill = active ? colors.bg : colors.text;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="3" width="6" height="11" rx="3" fill={fill} />
      <Path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export type GoalsEditorHandle = {
  polish: () => Promise<void>;
};

type GoalsEditorProps = {
  minHeight?: number;
  /** Hide inline polish button (onboarding uses footer instead). */
  hidePolishButton?: boolean;
};

export const GoalsEditor = forwardRef<GoalsEditorHandle, GoalsEditorProps>(function GoalsEditor(
  { minHeight = 220, hidePolishButton = false },
  ref,
) {
  const {
    goalsText,
    setGoals,
    connected,
    toggleConnected,
    notionAccessToken,
    notionDatabaseId,
    setNotionDatabaseId,
    setNotionToken,
  } = useGoalsStore();
  const rawDump = useRef('');
  const [polishing, setPolishing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [notionDatabases, setNotionDatabases] = useState<{ id: string; title: string }[]>([]);
  const [importingNotion, setImportingNotion] = useState(false);

  useEffect(() => {
    if (!notionAccessToken) return;
    void fetchNotionDatabases().then((dbs) => {
      setNotionDatabases(dbs);
      if (dbs.length === 1 && !useGoalsStore.getState().notionDatabaseId) {
        setNotionDatabaseId(dbs[0].id);
      }
    });
  }, [notionAccessToken, setNotionDatabaseId]);

  const handleConnect = async (service: ConnectService) => {
    if (connected.includes(service.id)) {
      if (service.id === 'notion') {
        setNotionToken(null);
        setNotionDatabaseId(null);
        setNotionDatabases([]);
      }
      toggleConnected(service.id);
      return;
    }
    setConnectingId(service.id);
    if (service.method === 'oauth') {
      const ok = await connectNotion();
      if (ok) {
        toggleConnected(service.id);
        const dbs = await fetchNotionDatabases();
        setNotionDatabases(dbs);
        if (dbs.length === 1) setNotionDatabaseId(dbs[0].id);
        if (dbs.length === 0) {
          Alert.alert(
            'Notion connected',
            'Share a goals database with your HopOff integration in Notion (••• → Connections), then pick it below to import.',
          );
        }
      }
      setConnectingId(null);
      return;
    }
    if (service.method === 'intent' && service.id === 'google_tasks') {
      const opened = await openGoogleTasks();
      setConnectingId(null);
      if (opened) {
        Alert.alert(
          'Google Tasks',
          'HopOff opened Google Tasks. Task import is not wired yet — copy tasks into your goals list above. Notion can import automatically.',
        );
        toggleConnected(service.id);
      }
      return;
    }
    await openShortcut(service.id);
    setConnectingId(null);
    toggleConnected(service.id);
  };

  const onTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal) {
        const chunk = text.trim();
        if (!chunk) return;
        rawDump.current = rawDump.current ? `${rawDump.current} ${chunk}` : chunk;
        const current = useGoalsStore.getState().goalsText;
        setGoals(current ? `${current} ${chunk}` : chunk);
      }
    },
    [setGoals],
  );

  const { listening, toggle } = useSpeechToText(onTranscript);

  const handleMic = () => {
    if (!listening) rawDump.current = '';
    toggle();
  };

  const handlePolish = async () => {
    const source = goalsText.trim() || rawDump.current.trim();
    if (!source) return;
    setPolishing(true);
    const polished = await polishGoalsWithAi(source);
    if (polished) {
      useGoalsStore.setState({ goalsText: polished, goalsPolished: true });
    }
    setEditing(false);
    setPolishing(false);
  };

  useImperativeHandle(ref, () => ({
    polish: handlePolish,
  }));

  const importFromNotion = async () => {
    if (!notionDatabaseId) return;
    setImportingNotion(true);
    const imported = await syncGoalsFromNotion(notionDatabaseId);
    if (imported) {
      setGoals(imported);
    } else {
      Alert.alert(
        'Notion import',
        'Could not import goals. In Notion, share a database with your HopOff integration, then pick it below.',
      );
    }
    setImportingNotion(false);
  };

  const lines = goalsText.split('\n').filter(Boolean);
  const showList = lines.length > 1 && !listening && !editing;

  return (
    <View>
      <AppText variant="subheading" style={{ marginBottom: spacing.md }}>
        What are your weekly goals?
      </AppText>

      <View style={{ position: 'relative' }}>
        <View
          style={{
            backgroundColor: listening ? 'rgba(255,255,255,0.06)' : glass.bg,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: listening ? colors.text : glass.border,
            borderTopColor: listening ? colors.text : glass.highlight,
            padding: spacing.lg,
            minHeight,
          }}
        >
        {showList ? (
          <Pressable onPress={() => setEditing(true)} style={{ gap: spacing.md, paddingRight: spacing.xxl }}>
            {lines.map((line, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: colors.text,
                    marginTop: 8,
                  }}
                />
                <AppText variant="bodyRegular" color={colors.text} style={{ flex: 1, lineHeight: 22 }}>
                  {line}
                </AppText>
              </View>
            ))}
          </Pressable>
        ) : (
          <TextInput
            value={goalsText}
            onChangeText={setGoals}
            onBlur={() => setEditing(false)}
            placeholder={listening ? 'Listening...' : 'Type or brain-dump here...'}
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            style={{
              flex: 1,
              fontFamily: fonts.regular,
              fontSize: 16,
              color: colors.text,
              paddingRight: spacing.xxl,
              minHeight: minHeight - spacing.lg * 2,
            }}
          />
        )}
        </View>
        <Pressable
          onPress={handleMic}
          accessibilityLabel={listening ? 'Stop recording' : 'Start recording'}
          style={({ pressed, hovered }) => ({
            position: 'absolute',
            top: spacing.lg,
            right: spacing.lg,
            zIndex: 2,
            opacity: pressed ? 0.6 : hovered ? 0.85 : 1,
            padding: spacing.sm,
            borderRadius: 999,
            backgroundColor: listening ? colors.text : 'transparent',
            borderWidth: listening ? 0 : 1,
            borderColor: glass.border,
          })}
          hitSlop={10}
        >
          <MicIcon active={listening} />
        </Pressable>
      </View>

      {listening ? (
        <AppText variant="caption" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
          Recording — tap mic again to stop
        </AppText>
      ) : null}

      {!hidePolishButton && goalsText.trim().length > 0 && (
        <PillButton
          label="Polish my list"
          variant="dark"
          size="compact"
          loading={polishing}
          style={{
            marginTop: spacing.sm,
            borderColor: colors.text,
            borderWidth: 1,
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}
          onPress={handlePolish}
        />
      )}

      <AppText variant="subheading" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        Pull in your goals
      </AppText>
      <View style={{ gap: spacing.md }}>
        {getConnectServicesForPlatform().map((s) => (
          <ConnectRow
            key={s.id}
            service={s}
            connected={connected.includes(s.id)}
            busy={connectingId === s.id}
            onPress={() => handleConnect(s)}
          />
        ))}
      </View>

      {(notionAccessToken || connected.includes('notion')) && notionDatabases.length > 0 ? (
        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <AppText variant="caption" color={colors.textMuted}>
            Choose a Notion database to import
          </AppText>
          {notionDatabases.map((db) => {
            const selected = notionDatabaseId === db.id;
            return (
              <Pressable key={db.id} onPress={() => setNotionDatabaseId(db.id)}>
                <GlassCard
                  selected={selected}
                  style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.md }}
                >
                  <AppText variant="body" color={selected ? colors.text : colors.textMuted}>
                    {db.title}
                  </AppText>
                </GlassCard>
              </Pressable>
            );
          })}
          <PillButton
            label="Import from Notion"
            variant="dark"
            size="compact"
            disabled={!notionDatabaseId}
            loading={importingNotion}
            onPress={importFromNotion}
          />
        </View>
      ) : null}
    </View>
  );
});
