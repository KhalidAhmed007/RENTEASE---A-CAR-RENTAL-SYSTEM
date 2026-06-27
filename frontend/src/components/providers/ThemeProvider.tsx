'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/themeStore';

/**
 * Applies the persisted theme class to <html> on first mount.
 * Should be rendered once near the root of the app.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
