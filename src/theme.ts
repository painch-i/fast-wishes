import { ThemeConfig } from 'antd';

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  card: 12,
} as const;

export const colors = {
  headerBg: '#FFF7F4', // pastel peach
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  primary: '#FF6B6B',
  accentPeach: '#FFE7E1',
  accentMint: '#E7FFF4',
  accentLavender: '#EFE7FF',
  accentYellow: '#FFF7D6',
  success: '#4caf50',
  reservedBg: '#f5f5f5',
} as const;

export const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorTextBase: colors.textPrimary,
    colorTextSecondary: colors.textSecondary,
    borderRadius: radii.sm,
    fontFamily: 'system-ui, sans-serif',
    controlHeight: 44,
  },
  components: {
    Button: {
      borderRadius: radii.sm,
    },
    Card: {
      borderRadius: radii.card,
      boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
    },
    Tag: {
      borderRadius: 999,
    },
  },
};

