'use client'

import type { Theme } from '@/lib/types/settings'

/**
 * Direct DOM manipulation for theme switching as fallback
 * This works even if next-themes isn't installed
 */
export function applyThemeDirectly(theme: Theme) {
  if (typeof window === 'undefined') return

  const root = window.document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    // Use system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    root.classList.add(systemTheme)
    root.setAttribute('data-theme', systemTheme)
    // Store 'system' in localStorage for persistence
    try {
      localStorage.setItem('theme', 'system')
    } catch (e) {
      // Ignore localStorage errors
    }
  } else {
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
    // Store theme in localStorage for persistence
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}

/**
 * Get system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Listen to system theme changes
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void) {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light')
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }
  // Fallback for older browsers
  else if (mediaQuery.addListener) {
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }

  return () => {}
}

