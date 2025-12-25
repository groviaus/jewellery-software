'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/calculations'
import { useInventoryAnalytics } from '@/lib/hooks/useAnalytics'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Package, DollarSign } from 'lucide-react'

export default function InventoryAnalytics() {
  const [goldRate, setGoldRate] = useState<string>('')
  const [days, setDays] = useState<number>(90)
  const [currentGoldRate, setCurrentGoldRate] = useState<number>(0)

  const { data: analytics, isLoading, refetch } = useInventoryAnalytics(
    currentGoldRate > 0 ? currentGoldRate : undefined,
    days
  )

  const handleApply = () => {
    const rate = parseFloat(goldRate)
    if (!isNaN(rate) && rate > 0) {
      setCurrentGoldRate(rate)
      refetch()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="gold_rate">Current Gold Rate (per gram)</Label>
              <Input
                id="gold_rate"
                type="number"
                step="0.01"
                min="0"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                placeholder="Enter gold rate"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Analysis Period (days)</Label>
              <Input
                id="days"
                type="number"
                min="1"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 90)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleApply} className="w-full">
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : analytics ? (
        <>
          {/* Stock Value Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.stock_value.total)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated current value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.turnover_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {analytics.analysis_period_days} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_items_sold}</div>
                <p className="text-xs text-muted-foreground">
                  In stock: {analytics.total_items_in_stock}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock by Metal</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {Object.entries(analytics.stock_value.by_metal_type).map(([metal, value]) => (
                    <div key={metal} className="flex justify-between text-sm">
                      <span>{metal}:</span>
                      <span className="font-medium">{formatCurrency(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fast Moving Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Fast Moving Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.fast_moving_items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Metal Type</TableHead>
                      <TableHead className="text-right">Quantity Sold</TableHead>
                      <TableHead className="text-right">Times Sold</TableHead>
                      <TableHead className="text-right">Last Sale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.fast_moving_items.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell className="font-medium">{item.item_name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.metal_type}</TableCell>
                        <TableCell className="text-right">{item.quantity_sold}</TableCell>
                        <TableCell className="text-right">{item.times_sold}</TableCell>
                        <TableCell className="text-right">
                          {item.last_sold_date
                            ? `${item.days_since_last_sale} days ago`
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-4">No fast moving items found</p>
              )}
            </CardContent>
          </Card>

          {/* Slow Moving Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                Slow Moving Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.slow_moving_items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Metal Type</TableHead>
                      <TableHead className="text-right">Quantity Sold</TableHead>
                      <TableHead className="text-right">Times Sold</TableHead>
                      <TableHead className="text-right">Days Since Last Sale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.slow_moving_items.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell className="font-medium">{item.item_name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.metal_type}</TableCell>
                        <TableCell className="text-right">{item.quantity_sold}</TableCell>
                        <TableCell className="text-right">{item.times_sold}</TableCell>
                        <TableCell className="text-right">
                          {item.days_since_last_sale !== null
                            ? `${item.days_since_last_sale} days`
                            : 'Never sold'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-4">No slow moving items found</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

