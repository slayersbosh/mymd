import { useSettingsStore } from '@/stores';
import { COLORS } from '@/types';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useSettingsStore();

  const isDark = theme === 'dark';

  // Light theme colors (complement to dark theme)
  const lightColors = {
    primary: '#FF6B00', // Same primary
    primaryHover: '#FF8533',
    primaryActive: '#CC5500',
    bgMain: '#FAFAFA',
    bgSidebar: '#F0F0F0',
    bgPanel: '#FFFFFF',
    border: '#E0E0E0',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textDisabled: '#AAAAAA',
    success: '#00C853',
    warning: '#FFB300',
    error: '#FF1744',
    codeBg: '#F5F5F5',
  };

  const colors = isDark ? COLORS : lightColors;

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{
        backgroundColor: colors.bgMain,
        color: colors.textPrimary,
      }}
    >
      {children}
    </div>
  );
}

// Hook for theme-aware styles
export function useThemeColors() {
  const { theme } = useSettingsStore();

  const isDark = theme === 'dark';

  return {
    ...(isDark ? COLORS : {
      primary: '#FF6B00',
      primaryHover: '#FF8533',
      primaryActive: '#CC5500',
      bgMain: '#FAFAFA',
      bgSidebar: '#F0F0F0',
      bgPanel: '#FFFFFF',
      border: '#E0E0E0',
      textPrimary: '#1A1A1A',
      textSecondary: '#666666',
      textDisabled: '#AAAAAA',
      success: '#00C853',
      warning: '#FFB300',
      error: '#FF1744',
      codeBg: '#F5F5F5',
    }),
    isDark,
  };
}