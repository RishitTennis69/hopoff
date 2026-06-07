import { Pressable, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, fonts, glass, radii, spacing } from '@/theme';

type Props = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: (text: string) => void;
  onClear?: () => void;
  /** Show X when a search is active even if the input was cleared */
  activeSearch?: boolean;
  variant?: 'light' | 'dark';
};

export function SearchBar({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSubmit,
  onClear,
  activeSearch,
  variant = 'light',
}: Props) {
  const dark = variant === 'dark';
  const submit = () => onSubmit?.(value);
  const clear = () => {
    onChangeText('');
    onClear?.();
  };
  const showClear = value.length > 0 || !!activeSearch;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: dark ? glass.bg : colors.card,
        borderRadius: radii.pill,
        borderWidth: dark ? 1 : 0,
        borderColor: dark ? glass.border : 'transparent',
        paddingLeft: spacing.lg,
        paddingRight: spacing.sm,
        height: 46,
        gap: spacing.sm,
      }}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Circle cx="11" cy="11" r="7" stroke={dark ? colors.textMuted : colors.cardMuted} strokeWidth={2} fill="none" />
        <Path d="M21 21l-4.3-4.3" stroke={dark ? colors.textMuted : colors.cardMuted} strokeWidth={2} strokeLinecap="round" />
      </Svg>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark ? colors.textMuted : colors.cardMuted}
        onSubmitEditing={submit}
        returnKeyType="search"
        style={{
          flex: 1,
          fontFamily: fonts.semibold,
          fontSize: 15,
          color: dark ? colors.text : colors.cardText,
        }}
      />
      {showClear && (
        <Pressable onPress={clear} hitSlop={8} style={{ padding: spacing.sm }}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M6 6l12 12M18 6L6 18" stroke={dark ? colors.textMuted : colors.cardMuted} strokeWidth={2.5} strokeLinecap="round" />
          </Svg>
        </Pressable>
      )}
      <Pressable
        onPress={submit}
        hitSlop={8}
        style={({ pressed, hovered }) => ({
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: dark
            ? pressed || hovered
              ? colors.text
              : glass.bgSelected
            : pressed || hovered
              ? colors.cardText
              : colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: dark ? 1 : 0,
          borderColor: glass.border,
        })}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Path
            d="M5 12h14M13 6l6 6-6 6"
            stroke={dark ? colors.text : colors.card}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </View>
  );
}
