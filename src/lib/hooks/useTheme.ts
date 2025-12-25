'use client'

import { useEffect, useState } from 'react'
import { useSettings } from './useSettings'
import type { Theme } from '@/lib/types/settings'
import { applyThemeDirectly, getSystemTheme, watchSystemTheme } from '@/lib/utils/theme'

// Try to import next-themes, but handle gracefully if not available
let useNextTheme: any = null
let NextThemesProvider: any = null

try {
  const nextThemes = require('next-themes')
  useNextTheme = nextThemes.useTheme
  NextThemesProvider = nextThemes.ThemeProvider
} catch (e) {
  console.warn('next-themes not installed - using fallback theme implementation')
}

/**
 * Hook to sync theme from settings
 * This ensures the theme preference from the database is applied
 */
export function useThemeSync() {
  const { data: settings, isLoading } = useSettings()
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)
  const [mounted, setMounted] = useState(false)

  // On mount, check localStorage first for immediate theme application
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem('theme') as Theme | null
        if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
          applyThemeDirectly(storedTheme)
          setCurrentTheme(storedTheme)
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }, [])

  // Sync with database settings when loaded
  useEffect(() => {
    if (!isLoading && settings?.theme) {
      const themeToApply = settings.theme
      
      // Apply theme directly to DOM
      applyThemeDirectly(themeToApply)
      setCurrentTheme(themeToApply)
    } else if (!isLoading && !settings?.theme && mounted) {
      // No theme in settings, use default
      applyThemeDirectly('light')
      setCurrentTheme('light')
    }
  }, [settings?.theme, isLoading, mounted])

  // Watch for system theme changes if theme is 'system'
  useEffect(() => {
    if (currentTheme === 'system' && mounted) {
      const cleanup = watchSystemTheme(() => {
        applyThemeDirectly('system')
      })
      return cleanup
    }
  }, [currentTheme, mounted])
}

/**
 * Hook to get and set theme, synced with settings
 * Works with or without next-themes
 */
export function useTheme() {
  const [localTheme, setLocalTheme] = useState<Theme | null>(null)
  const { data: settings } = useSettings()
  const [mounted, setMounted] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    if (settings?.theme) {
      applyThemeDirectly(settings.theme)
      setLocalTheme(settings.theme)
    } else {
      // Default to light if no settings
      applyThemeDirectly('light')
      setLocalTheme('light')
    }
  }, [settings?.theme])

  // Get current theme
  const currentTheme = localTheme || settings?.theme || 'light'

  // Get resolved theme (actual theme being used)
  const resolvedTheme = 
    currentTheme === 'system' 
      ? (typeof window !== 'undefined' ? getSystemTheme() : 'light')
      : currentTheme

  const setTheme = async (newTheme: Theme) => {
    // Apply theme directly to DOM immediately - this always works
    applyThemeDirectly(newTheme)
    setLocalTheme(newTheme)

    // Try to update settings in database (non-blocking)
    if (settings) {
      try {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...settings,
            theme: newTheme,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.warn('Failed to update theme in database:', errorData.error || 'Unknown error')
        }
      } catch (error) {
        console.warn('Failed to update theme in database:', error)
      }
    }
  }

  // Watch for system theme changes if theme is 'system'
  useEffect(() => {
    if (currentTheme === 'system' && mounted) {
      const cleanup = watchSystemTheme(() => {
        applyThemeDirectly('system')
      })
      return cleanup
    }
  }, [currentTheme, mounted])

  return {
    theme: currentTheme as Theme,
    setTheme,
    resolvedTheme: resolvedTheme as 'light' | 'dark',
  }
}

