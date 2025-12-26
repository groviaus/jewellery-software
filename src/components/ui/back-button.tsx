'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  href?: string
  className?: string
}

export function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show back button on parent pages (Dashboard, Billing, Analytics, etc.)
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length <= 1) return null

  // Determine parent route based on current path
  const getParentRoute = () => {
    if (href) return href

    // For deep links (level 3+), go back to the main section (e.g. /billing/invoice/123 -> /billing)
    if (parts.length > 2) {
      return '/' + parts[0]
    }

    // For 2-level subpages (e.g. /reports/daily), go up one level
    return '/' + parts.slice(0, -1).join('/')
  }

  const handleBack = () => {
    if (href) {
      router.push(href)
    } else {
      router.push(getParentRoute())
    }
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleBack}
      className={cn("gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  )
}

