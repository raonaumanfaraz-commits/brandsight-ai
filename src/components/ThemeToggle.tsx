'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'brandsight-theme';

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  }
  return mode;
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute('data-theme', resolved);
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // storage unavailable, theme still applies for this session
  }
}

/**
 * Light / Dark / System theme toggle.
 * Default is Premium Dark Mode. Choice persists in localStorage and the
 * resolved theme is applied before first paint by the inline script in
 * layout.tsx, so there is no theme flash on load.
 */
export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    let initial: ThemeMode = 'dark';
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        initial = stored;
      }
    } catch {
      // ignore, fall back to dark
    }
    setMode(initial);
    applyTheme(initial);

    // Follow the OS setting while in System mode
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      try {
        if ((localStorage.getItem(STORAGE_KEY) as ThemeMode | null) === 'system') {
          applyTheme('system');
        }
      } catch {
        // ignore
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const options: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light theme', icon: <Sun size={15} /> },
    { value: 'dark', label: 'Dark theme', icon: <Moon size={15} /> },
    { value: 'system', label: 'System theme', icon: <Monitor size={15} /> },
  ];

  return (
    <div
      role="group"
      aria-label="Color theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        background: 'var(--bg-tonal)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '9999px',
        padding: '3px',
      }}
    >
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={active}
            onClick={() => {
              setMode(opt.value);
              applyTheme(opt.value);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '9999px',
              minHeight: 'auto',
              padding: 0,
              background: active ? 'var(--accent-primary)' : 'transparent',
              color: active ? '#ffffff' : 'var(--text-muted)',
              boxShadow: active ? '0 2px 8px var(--accent-glow)' : 'none',
              transition: 'all 200ms ease',
            }}
          >
            {opt.icon}
          </button>
        );
      })}
    </div>
  );
}
