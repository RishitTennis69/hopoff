import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View, TextInput } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { AppIcon } from '@/components/AppIcon';
import { AppText } from '@/components/AppText';
import { GlassCard } from '@/components/GlassCard';
import { PillButton } from '@/components/PillButton';
import { CONNECT_SERVICES, type ConnectService } from '@/data/mock';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useGoalsStore } from '@/store/goalsStore';
import { polishGoalsWithAi } from '@/utils/ai';
import { connectNotion, openShortcut } from '@/utils/connect';
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
  const c = active ? colors.text : colors.textMuted;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x="9" y="3" width="6" height="11" rx="3" fill={c} />
      <Path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function GoalsEditor({ minHeight = 220 }: { minHeight?: number }) {
  const { goalsText, setGoals, connected, toggleConnected } = useGoalsStore();
  const rawDump = useRef('');
  const [polishing, setPolishing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (service: ConnectService) => {
    if (connected.includes(service.id)) {
      toggleConnected(service.id);
      return;
    }
    setConnectingId(service.id);
    if (service.method === 'oauth') {
      await connectNotion();
    } else {
      await openShortcut(service.id);
    }
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
    if (polished) setGoals(polished);
    setEditing(false);
    setPolishing(false);
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
            backgroundColor: glass.bg,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: glass.border,
            borderTopColor: glass.highlight,
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
          style={({ pressed, hovered }) => ({
            position: 'absolute',
            top: spacing.lg,
            right: spacing.lg,
            zIndex: 2,
            opacity: pressed ? 0.6 : hovered ? 0.85 : 1,
            padding: 4,
          })}
          hitSlop={10}
        >
          <MicIcon active={listening} />
        </Pressable>
      </View>

      {goalsText.trim().length > 0 && (
        <PillButton
          label="Polish my list"
          variant="dark"
          size="compact"
          loading={polishing}
          style={{ marginTop: spacing.sm }}
          onPress={handlePolish}
        />
      )}

      <AppText variant="subheading" style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        Pull in your goals
      </AppText>
      <View style={{ gap: spacing.md }}>
        {CONNECT_SERVICES.map((s) => (
          <ConnectRow
            key={s.id}
            service={s}
            connected={connected.includes(s.id)}
            busy={connectingId === s.id}
            onPress={() => handleConnect(s)}
          />
        ))}
      </View>
    </View>
  );
}
