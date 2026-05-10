import { Appearance } from 'react-native';

export const palettes = {
  light: {
    primary: '#14B884',
    primaryLight: '#E7FBF3',
    primaryDark: '#087056',
    accent: '#FFB020',
    background: '#F6F8FB',
    backgroundSecondary: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E4E8F0',
    borderLight: '#EEF2F7',
    textPrimary: '#101828',
    textSecondary: '#667085',
    textMuted: '#98A2B3',
    error: '#E5484D',
    danger: '#E5484D',
    dangerLight: '#FEECEC',
    warning: '#F59E0B',
    warningLight: '#FFF7E6',
    info: '#377DFF',
    infoLight: '#EAF1FF',
    success: '#14B884',
    successLight: '#E7FBF3',
    white: '#FFFFFF',
    shadow: '#101828',
  },
  dark: {
    primary: '#34D399',
    primaryLight: '#123D32',
    primaryDark: '#A7F3D0',
    accent: '#FBBF24',
    background: '#0B1120',
    backgroundSecondary: '#111827',
    surface: '#111827',
    surfaceRaised: '#172033',
    border: '#263244',
    borderLight: '#1F2937',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    error: '#FB7185',
    danger: '#FB7185',
    dangerLight: '#3F1720',
    warning: '#FBBF24',
    warningLight: '#3B2A0B',
    info: '#60A5FA',
    infoLight: '#152B4A',
    success: '#34D399',
    successLight: '#123D32',
    white: '#FFFFFF',
    shadow: '#000000',
  },
};

export const defaultTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
export const colors = palettes[defaultTheme];

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 36,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 22, full: 999,
};

export const font = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const fontWeight = font;

export const shadow = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: defaultTheme === 'dark' ? 0.22 : 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOpacity: defaultTheme === 'dark' ? 0.16 : 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
};
