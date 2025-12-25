'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/calculations'
import { format } from 'date-fns'
import { useSoldItemsReport } from '@/lib/hooks/useReports'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { Skeleton } from '@/components/ui/skeleton'
import { exportToCSV } from '@/lib/utils/csv-export'
import { exportReportToPDF } from '@/lib/utils/pdf-export'
import { exportReportToExcel } from '@/lib/utils/excel-export'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'

export default function SoldItemsReport() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [selectedMetalType, setSelectedMetalType] = useState<string>('all')
  
  const { data: customers = [] } = useCustomers()
  const { data: items = [], isLoading, refetch } = useSoldItemsReport(
    undefined,
    undefined,
    selectedCustomer !== 'all' ? selectedCustomer : undefined,
    selectedMetalType !== 'all' ? selectedMetalType : undefined
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sold Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleExportCSV = () => {
    if (items.length === 0) {
      return
    }

    const exportData = items.map((item) => ({
      'Item Name': item.item_name,
      SKU: item.sku,
      'Quantity Sold': item.quantity_sold,
      'Total Revenue': item.total_revenue,
      'Last Sold': format(new Date(item.last_sold_date), 'MMM dd, yyyy'),
    }))

    exportToCSV(exportData, 'sold-items-report')
  }

  const handleExportPDF = () => {
    if (items.length === 0) {
      return
    }

    const exportData = items.map((item) => ({
      'Item Name': item.item_name,
      SKU: item.sku,
      'Quantity Sold': item.quantity_sold,
      'Total Revenue': formatCurrency(item.total_revenue),
      'Last Sold': format(new Date(item.last_sold_date), 'MMM dd, yyyy'),
    }))

    exportReportToPDF(exportData, 'Sold Items Report', 'sold-items-report')
  }

  const handleExportExcel = () => {
    if (items.length === 0) {
      return
    }

    const exportData = items.map((item) => ({
      'Item Name': item.item_name,
      SKU: item.sku,
      'Quantity Sold': item.quantity_sold,
      'Total Revenue': item.total_revenue,
      'Last Sold': format(new Date(item.last_sold_date), 'MMM dd, yyyy'),
    }))

    exportReportToExcel(exportData, 'Sold Items Report', 'sold-items-report')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sold Items</CardTitle>
          {items.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
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
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metal_type">Metal Type</Label>
            <Select value={selectedMetalType} onValueChange={setSelectedMetalType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => refetch()} disabled={isLoading} className="w-full">
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500">No sold items found</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity Sold</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Last Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.item_id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell className="text-right">{item.quantity_sold}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.total_revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {format(new Date(item.last_sold_date), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

