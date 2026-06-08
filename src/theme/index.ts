export const colors = {
  bg: '#000000',
  bgElevated: '#0A0A0A',
  bgInput: '#111111',
  bgTint: '#080808',
  card: '#F0F0F0',
  cardText: '#000000',
  cardSubtle: '#E8E8E8',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.55)',
  textFaint: 'rgba(255,255,255,0.3)',
  cardMuted: '#6B7280',
  border: 'rgba(255,255,255,0.12)',
  borderDark: 'rgba(0,0,0,0.12)',
  accent: '#3466AA',
  accentDim: 'rgba(52,102,170,0.18)',
  danger: '#FF5247',
  success: '#34C759',
  track: 'rgba(255,255,255,0.08)',
} as const;

export const glass = {
  bg: 'rgba(255,255,255,0.04)',
  bgHover: 'rgba(255,255,255,0.07)',
  bgPressed: 'rgba(255,255,255,0.09)',
  bgSelected: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.10)',
  borderHover: 'rgba(255,255,255,0.18)',
  borderActive: 'rgba(255,255,255,0.38)',
  highlight: 'rgba(255,255,255,0.06)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  black: 'Inter_900Black',
  extraBold: 'Inter_800ExtraBold',
  bold: 'Inter_700Bold',
  semibold: 'Inter_600SemiBold',
  regular: 'Inter_400Regular',
} as const;

export const typography = {
  hero: { fontFamily: fonts.black, fontSize: 38, lineHeight: 42 },
  title: { fontFamily: fonts.extraBold, fontSize: 30, lineHeight: 34 },
  heading: { fontFamily: fonts.extraBold, fontSize: 22, lineHeight: 26 },
  subheading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 22 },
  body: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  bodyRegular: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17 },
  caption: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14 },
} as const;

export const brand = {
  twitter: { bg: '#1DA1F2', fg: '#FFFFFF' },
  tiktok: { bg: '#000000', fg: '#FFFFFF' },
  youtube: { bg: '#FF0000', fg: '#FFFFFF' },
  youtubeShorts: { bg: '#FF0033', fg: '#FFFFFF' },
  instagram: { bg: '#E1306C', fg: '#FFFFFF' },
  instagramReels: { bg: '#C13584', fg: '#FFFFFF' },
  snapchat: { bg: '#FFFC00', fg: '#000000' },
  reddit: { bg: '#FF4500', fg: '#FFFFFF' },
  facebook: { bg: '#1877F2', fg: '#FFFFFF' },
  notes: { bg: '#FECE4E', fg: '#000000' },
  reminders: { bg: '#FFFFFF', fg: '#FF3B30' },
  notion: { bg: '#FFFFFF', fg: '#000000' },
  googleTasks: { bg: '#1A73E8', fg: '#FFFFFF' },
} as const;

export type ThemeColors = typeof colors;
