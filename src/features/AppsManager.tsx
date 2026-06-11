import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/AppText';
import { GroupCard } from '@/components/GroupCard';
import { PillButton } from '@/components/PillButton';
import { SelectRow } from '@/components/SelectRow';
import { APP_CATALOG } from '@/data/mock';
import { useAppsStore } from '@/store/appsStore';
import { refreshInstalledApps } from '@/services/deviceUsage';
import { colors, spacing } from '@/theme';

export function AppsManager({ editableGroups = false }: { editableGroups?: boolean }) {
  const router = useRouter();
  const {
    checkedIds,
    groups,
    installedAppIds,
    toggleChecked,
    selectAllUngrouped,
    clearChecked,
    beginGroupFromChecked,
  } = useAppsStore();
  const [detecting, setDetecting] = useState(false);

  const runDetection = () => {
    setDetecting(true);
    return refreshInstalledApps().finally(() => setDetecting(false));
  };

  useEffect(() => {
    void runDetection();
  }, []);

  const groupedIds = useMemo(() => groups.flatMap((g) => g.appIds), [groups]);
  const installedSet = useMemo(() => new Set(installedAppIds), [installedAppIds]);

  const catalog = useMemo(
    () => APP_CATALOG.filter((a) => installedSet.has(a.id)),
    [installedSet],
  );

  const ungrouped = useMemo(
    () => catalog.filter((a) => !groupedIds.includes(a.id)),
    [catalog, groupedIds],
  );

  const canGroup = checkedIds.length >= 2;
  const allUngroupedSelected =
    ungrouped.length > 0 && ungrouped.every((a) => checkedIds.includes(a.id));

  const createGroup = () => {
    beginGroupFromChecked();
    router.push('/group-modal');
  };

  const toggleSelectAll = () => {
    if (allUngroupedSelected) clearChecked();
    else selectAllUngrouped();
  };

  return (
    <View style={{ gap: spacing.md }}>
      <Pressable
        onPress={canGroup ? createGroup : undefined}
        disabled={!canGroup}
        style={{ alignSelf: 'stretch', opacity: canGroup ? 1 : 0.4 }}
      >
        <View pointerEvents="none">
          <PillButton label="Create Group" variant="dark" disabled={!canGroup} fullWidth />
        </View>
      </Pressable>
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.xs,
          }}
        >
          <AppText variant="caption" color={colors.textMuted}>
            Apps
          </AppText>
          {ungrouped.length > 0 ? (
            <Pressable onPress={toggleSelectAll} hitSlop={8}>
              <AppText variant="caption" color={colors.text}>
                {allUngroupedSelected ? 'Deselect all' : 'Select all'}
              </AppText>
            </Pressable>
          ) : null}
        </View>
        {detecting && catalog.length === 0 ? (
          <AppText variant="bodyRegular" color={colors.textMuted} center style={{ paddingVertical: spacing.md }}>
            Checking which apps are on your phone…
          </AppText>
        ) : null}
        {!detecting && catalog.length === 0 ? (
          <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md }}>
            <AppText variant="bodyRegular" color={colors.textMuted} center>
              Only seeing YouTube? Install the latest dev APK — Android hides other apps until the native build
              includes package visibility. Then tap Refresh.
            </AppText>
            <Pressable onPress={() => void runDetection()} hitSlop={8}>
              <AppText variant="small" color={colors.text}>
                Refresh app list
              </AppText>
            </Pressable>
          </View>
        ) : null}
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
