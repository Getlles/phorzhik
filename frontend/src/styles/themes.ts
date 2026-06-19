export type ThemeName = 'auth' | 'login' | 'edit' | 'personal';

export interface ThemeColors {
  background: string;
  circle?: string;
}

export const themeColors: Record<ThemeName, ThemeColors> = {
  auth: {
    background: 'var(--bg-header-footer)',
    circle: 'var(--color-circle-auth)',
  },
  login: {
    background: 'var(--bg-header-footer-log)',
    circle: 'var(--color-circle-log)',
  },
  edit: {
    background: 'var(--bg-header-footer-edit)',
    circle: 'var(--color-circle-edit)',
  },
  personal: {
    background: 'var(--bg-header-footer)',
    circle: 'var(--color-circle-personal)',
  },
};