'use client'

import { useThemeSync } from '@/lib/hooks/useTheme'

/**
 * Component to sync theme from settings on mount
 * Place this in a client component layout
 */
export function ThemeSync() {
  useThemeSync()
  return null
}

