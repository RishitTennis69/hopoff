import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { HourWheel } from '@/components/HourWheel';
import { PillButton } from '@/components/PillButton';
import { PopupBackdrop } from '@/components/PopupBackdrop';
import { PopupPanel } from '@/components/PopupPanel';
import { useAppsStore } from '@/store/appsStore';
import { colors, fonts, spacing } from '@/theme';

const PLACEHOLDER = 'Name of your group';
const NAME_FONT_SIZE = 26;
const NAME_LINE_HEIGHT = 32;

export default function GroupModal() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { draftAppIds, groups, finalizeGroup, updateGroup } = useAppsStore();

  const editing = groupId ? groups.find((g) => g.id === groupId) : undefined;
  const appIds = editing ? editing.appIds : draftAppIds;

  const [name, setName] = useState(editing?.name ?? '');
  const [hours, setHours] = useState(editing?.hours ?? 0.5);

  const save = () => {
    const groupName = name.trim() || 'My Group';
    if (editing) updateGroup(editing.id, { name: groupName, hours });
    else finalizeGroup(groupName, hours);
    if (router.canGoBack()) router.back();
  };

  return (
    <PopupBackdrop>
      <PopupPanel>
        <View style={{ alignSelf: 'stretch', marginBottom: spacing.lg }}>
          <View style={{ minHeight: NAME_LINE_HEIGHT, justifyContent: 'center' }}>
            {!name && (
              <AppText
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: spacing.lg,
                  right: spacing.lg,
                  fontFamily: fonts.extraBold,
                  fontSize: NAME_FONT_SIZE,
                  lineHeight: NAME_LINE_HEIGHT,
                  color: colors.textMuted,
                  textAlign: 'center',
                }}
              >
                {PLACEHOLDER}
              </AppText>
            )}
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder=""
              placeholderTextColor={colors.textMuted}
              textAlign="center"
              selectionColor="rgba(75, 139, 255, 0.5)"
              cursorColor="#5B9FFF"
              autoCorrect={false}
              style={{
                fontFamily: fonts.extraBold,
                fontSize: NAME_FONT_SIZE,
                lineHeight: NAME_LINE_HEIGHT,
                color: colors.text,
                width: '100%',
                paddingHorizontal: spacing.lg,
                paddingVertical: 0,
                margin: 0,
                minHeight: NAME_LINE_HEIGHT,
                includeFontPadding: false,
                textAlignVertical: 'center',
              }}
            />
          </View>
        </View>
        <HourWheel appIds={appIds} hours={hours} onChange={setHours} valuePerSpoke={0.5} />
        <View style={{ width: '100%', marginTop: spacing.xxl }}>
          <PillButton label="Save Group" onPress={save} />
        </View>
      </PopupPanel>
    </PopupBackdrop>
  );
}
