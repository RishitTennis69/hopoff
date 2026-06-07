import { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { GroupCard } from '@/components/GroupCard';
import { PillButton } from '@/components/PillButton';
import { SelectRow } from '@/components/SelectRow';
import { APP_CATALOG } from '@/data/mock';
import { useAppsStore } from '@/store/appsStore';
import { colors, spacing } from '@/theme';

export function AppsManager({ editableGroups = false }: { editableGroups?: boolean }) {
  const router = useRouter();
  const { checkedIds, groups, toggleChecked, beginGroupFromChecked } = useAppsStore();

  const groupedIds = useMemo(() => groups.flatMap((g) => g.appIds), [groups]);

  const ungrouped = useMemo(
    () => APP_CATALOG.filter((a) => !groupedIds.includes(a.id)),
    [groupedIds],
  );

  const canGroup = checkedIds.length >= 2;

  const createGroup = () => {
    beginGroupFromChecked();
    router.push('/group-modal');
  };

  return (
    <View style={{ gap: spacing.md }}>
      <PillButton
        label="Create Group"
        variant="dark"
        disabled={!canGroup}
        onPress={createGroup}
      />
      {groups.length === 0 && (
        <AppText variant="small" color={colors.textMuted} center>
          {canGroup
            ? 'Tap Create Group to set a shared daily limit — you need at least one group to continue.'
            : 'Select 2+ apps, then create a group to continue.'}
        </AppText>
      )}

      {groups.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <AppText variant="caption" color={colors.textMuted} style={{ paddingHorizontal: spacing.xs }}>
            Groups
          </AppText>
          {groups.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              variant="dark"
              interactive={editableGroups}
              onPress={() => router.push({ pathname: '/group-modal', params: { groupId: g.id } })}
            />
          ))}
        </View>
      )}

      <View style={{ gap: spacing.sm }}>
        <AppText variant="caption" color={colors.textMuted} style={{ paddingHorizontal: spacing.xs }}>
          Apps
        </AppText>
        {ungrouped.map((app) => (
          <SelectRow
            key={app.id}
            variant="dark"
            brandKey={app.brand}
            label={app.name}
            checked={checkedIds.includes(app.id)}
            onToggle={() => toggleChecked(app.id)}
          />
        ))}
      </View>
    </View>
  );
}
