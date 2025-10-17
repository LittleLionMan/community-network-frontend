'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('system');
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
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
    <div className="rounded-lg border p-4">
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
                ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
            }`}
          >
            <Icon
              className={`mb-2 h-5 w-5 ${
                theme === value
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                theme === value
                  ? 'text-indigo-900 dark:text-indigo-300'
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
