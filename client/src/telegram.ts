import type { ThemeColors } from './types.ts';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        expand(): void;
        close(): void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        viewportHeight: number;
        viewportStableHeight: number;
        platform: string;
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
        onEvent(event: string, callback: () => void): void;
        BackButton: {
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
        };
      };
    };
  }
}

const tg = window.Telegram?.WebApp;

export function initTelegram(): void {
  if (tg) {
    tg.ready();
    tg.expand();
  }
}

export function getTheme(): ThemeColors {
  const params = tg?.themeParams;
  const isDark = !params?.bg_color || isColorDark(params.bg_color);

  if (isDark) {
    return {
      bg: params?.bg_color || '#1a1a2e',
      gridBg: '#16213e',
      gridLine: '#1e3054',
      cellBorder: '#0f1a2e',
      text: params?.text_color || '#ffffff',
      textSecondary: params?.hint_color || '#8899aa',
      button: params?.button_color || '#6c5ce7',
    };
  }

  return {
    bg: params?.bg_color || '#f0f0f0',
    gridBg: '#e8e8e8',
    gridLine: '#d0d0d0',
    cellBorder: '#c0c0c0',
    text: params?.text_color || '#1a1a1a',
    textSecondary: params?.hint_color || '#666666',
    button: params?.button_color || '#6c5ce7',
  };
}

export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error'): void {
  if (!tg?.HapticFeedback) return;
  if (type === 'success' || type === 'error') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}

function isColorDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
