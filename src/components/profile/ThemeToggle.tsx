'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme =
      (localStorage.getItem('theme') as Theme | null) || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    root.classList.remove('dark', 'light');

    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.add('light');
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Hell', icon: Sun },
    { value: 'dark', label: 'Dunkel', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
        Design
      </h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Wähle dein bevorzugtes Farbschema
      </p>

      <div className="grid grid-cols-3 gap-3">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all ${
              theme === value
                ? 'dark:bg-community-950 border-community-600 bg-community-50 dark:border-community-400'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500'
            }`}
          >
            <Icon
              className={`mb-2 h-5 w-5 ${
                theme === value
                  ? 'text-community-600 dark:text-community-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                theme === value
                  ? 'text-community-900 dark:text-community-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
