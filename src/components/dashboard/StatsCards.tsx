'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/calculations'
import { TrendingUp, Package, DollarSign } from 'lucide-react'
import { useTodayInvoices } from '@/lib/hooks/useInvoices'
import { useInventory } from '@/lib/hooks/useInventory'
import { useMemo } from 'react'

interface StatsCardsProps {
  todaySales?: number
  totalStock?: number
}

export default function StatsCards({ todaySales: initialTodaySales, totalStock: initialTotalStock }: StatsCardsProps) {
  // Use server-provided data as primary, React Query for updates
  const { data: todayInvoices } = useTodayInvoices({ initialData: [] })
  const { data: items } = useInventory()

  const todaySales = useMemo(() => {
    // Prefer server-provided data, fallback to calculated from React Query
    if (initialTodaySales !== undefined) {
      return initialTodaySales
    }
    if (todayInvoices && todayInvoices.length > 0) {
      return todayInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0)
    }
    return 0
  }, [todayInvoices, initialTodaySales])

  const totalStock = useMemo(() => {
    // Prefer server-provided data, fallback to calculated from React Query
    if (initialTotalStock !== undefined) {
      return initialTotalStock
    }
    if (items && items.length > 0) {
      return items.reduce((sum, item) => sum + item.quantity, 0)
    }
    return 0
  }, [items, initialTotalStock])
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todaySales)}</div>
          <p className="text-xs text-muted-foreground">
            Revenue from today's transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStock}</div>
          <p className="text-xs text-muted-foreground">
            Total items in inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Active</div>
          <p className="text-xs text-muted-foreground">
            Store is operational
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

