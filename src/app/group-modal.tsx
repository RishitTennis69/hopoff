import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HourWheel } from '@/components/HourWheel';
import { PillButton } from '@/components/PillButton';
import { PopupBackdrop } from '@/components/PopupBackdrop';
import { PopupPanel } from '@/components/PopupPanel';
import { useAppsStore } from '@/store/appsStore';
import { colors, fonts, spacing } from '@/theme';

export default function GroupModal() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const { draftAppIds, groups, finalizeGroup, updateGroup } = useAppsStore();

  const editing = groupId ? groups.find((g) => g.id === groupId) : undefined;
  const appIds = editing ? editing.appIds : draftAppIds;

  const [name, setName] = useState(editing?.name ?? '');
  const [hours, setHours] = useState(editing?.hours ?? 2);

  const save = () => {
    if (editing) updateGroup(editing.id, { name, hours });
    else finalizeGroup(name, hours);
    if (router.canGoBack()) router.back();
  };

  return (
    <PopupBackdrop>
      <PopupPanel>
        <View style={{ alignSelf: 'stretch', marginBottom: spacing.lg }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name of your group"
            placeholderTextColor={colors.textMuted}
            textAlign="center"
            selectionColor={colors.text}
            style={{
              fontFamily: fonts.extraBold,
              fontSize: 26,
              color: colors.text,
              width: '100%',
              paddingHorizontal: spacing.lg,
              includeFontPadding: false,
            }}
          />
        </View>
        <HourWheel appIds={appIds} hours={hours} onChange={setHours} />
        <View style={{ width: '100%', marginTop: spacing.xxl }}>
          <PillButton label="Save Group" onPress={save} />
        </View>
      </PopupPanel>
    </PopupBackdrop>
  );
}
