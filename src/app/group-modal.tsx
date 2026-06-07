import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { HourWheel } from '@/components/HourWheel';
import { PillButton } from '@/components/PillButton';
import { PopupBackdrop } from '@/components/PopupBackdrop';
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
      <Card tone="dark" style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name of your group"
          placeholderTextColor={colors.textMuted}
          style={{
            fontFamily: fonts.extraBold,
            fontSize: 26,
            color: colors.text,
            textAlign: 'center',
            marginBottom: spacing.lg,
            width: '100%',
          }}
        />
        <HourWheel appIds={appIds} hours={hours} onChange={setHours} />
        <View style={{ width: '100%', marginTop: spacing.xxl }}>
          <PillButton label="Save Group" onPress={save} />
        </View>
      </Card>
    </PopupBackdrop>
  );
}
