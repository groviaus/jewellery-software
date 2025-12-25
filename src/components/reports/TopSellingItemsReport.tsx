'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/calculations'
import { format } from 'date-fns'
import { useTopSellingItems } from '@/lib/hooks/useReports'
import { Skeleton } from '@/components/ui/skeleton'
import { exportReportToPDF } from '@/lib/utils/pdf-export'
import { exportReportToExcel } from '@/lib/utils/excel-export'
import { FileText, FileSpreadsheet } from 'lucide-react'

export default function TopSellingItemsReport() {
  const [startDate, setStartDate] = useState(
    format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [limit, setLimit] = useState(10)
  
  const { data: items = [], isLoading, refetch } = useTopSellingItems(
    startDate ? `${startDate}T00:00:00.000Z` : undefined,
    endDate ? `${endDate}T23:59:59.999Z` : undefined,
    limit
  )

  const fetchReport = () => {
    refetch()
  }

  const handleExportPDF = () => {
    if (items.length === 0) return

    const exportData = items.map((item, index) => ({
      Rank: index + 1,
      'Item Name': item.item_name,
      SKU: item.sku,
      'Metal Type': item.metal_type,
      'Quantity Sold': item.quantity_sold,
      'Times Sold': item.times_sold,
      'Total Revenue': formatCurrency(item.total_revenue),
    }))

    exportReportToPDF(
      exportData,
      `Top ${limit} Selling Items (${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')})`,
      `top-selling-${startDate}-to-${endDate}`
    )
  }

  const handleExportExcel = () => {
    if (items.length === 0) return

    const exportData = items.map((item, index) => ({
      Rank: index + 1,
      'Item Name': item.item_name,
      SKU: item.sku,
      'Metal Type': item.metal_type,
      'Quantity Sold': item.quantity_sold,
      'Times Sold': item.times_sold,
      'Total Revenue': item.total_revenue,
    }))

    exportReportToExcel(
      exportData,
      `Top ${limit} Selling Items (${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')})`,
      `top-selling-${startDate}-to-${endDate}`
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Selling Items</CardTitle>
          {items.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Top N Items</Label>
            <Input
              id="limit"
              type="number"
              min="1"
              max="100"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchReport} disabled={isLoading} className="w-full">
              {isLoading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Metal Type</TableHead>
                  <TableHead className="text-right">Quantity Sold</TableHead>
                  <TableHead className="text-right">Times Sold</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.item_id}>
                    <TableCell className="font-bold">#{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.metal_type}</TableCell>
                    <TableCell className="text-right">{item.quantity_sold}</TableCell>
                    <TableCell className="text-right">{item.times_sold}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.total_revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : !isLoading ? (
          <p className="text-center text-gray-500">No items found for the selected period</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

