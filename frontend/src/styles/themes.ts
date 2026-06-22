export type ThemeName = 'auth' | 'login' | 'edit' | 'account';

export interface ThemeColors {
  background: string;
  circle?: string;
  border?: string;
  inputText?: string;
  btnText?: string;
}

export const themeColors: Record<ThemeName, ThemeColors> = {
  auth: {
    background: 'var(--bg-header-footer)',
    circle: 'var(--color-circle-auth)',
    border: 'var(--input-btn-border-auth)',
    inputText: 'var(--input-text-auth)',
    btnText: 'var(--btn-text-auth)',
  },
  login: {
    background: 'var(--bg-header-footer-log)',
    circle: 'var(--color-circle-log)',
    border: 'var(--input-btn-border-log)',
    inputText: 'var(--input-text-log)',
    btnText: 'var(--btn-text-log)',
  },
  edit: {
    background: 'var(--bg-header-footer-edit)',
    circle: 'var(--color-circle-edit)',
  },
  account: {
    background: 'var(--bg-header-footer)',
    circle: 'var(--color-circle-personal)',
  },
};