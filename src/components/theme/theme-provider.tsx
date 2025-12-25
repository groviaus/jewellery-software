'use client'

import * as React from 'react'

// Try to import next-themes, but provide fallback if not available
let NextThemesProvider: any = null
let hasNextThemes = false

try {
  const nextThemes = require('next-themes')
  NextThemesProvider = nextThemes.ThemeProvider
  hasNextThemes = true
} catch (e) {
  console.warn('next-themes not installed - using fallback theme implementation')
}

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // If next-themes is available, use it
  if (hasNextThemes && NextThemesProvider) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
  }

  // Fallback: just render children
  // Theme will be managed via direct DOM manipulation
  return <>{children}</>
}

