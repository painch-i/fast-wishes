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
  lg: 16,
} as const;

export const colors = {
  headerBg: '#fff2e8', // pastel peach
  textPrimary: '#222',
  textSecondary: '#666',
  primary: '#ff6f61',
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
  },
  components: {
    Button: {
      borderRadius: radii.sm,
    },
    Card: {
      borderRadius: radii.lg,
      boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
    },
    Tag: {
      borderRadius: 999,
    },
  },
};

