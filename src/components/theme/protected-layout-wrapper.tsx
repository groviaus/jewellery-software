'use client'

import { ThemeSync } from './theme-sync'

export function ProtectedLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeSync />
      {children}
    </>
  )
}

