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
import { useDailySalesReport } from '@/lib/hooks/useReports'

export default function DailySalesReport() {
  const [startDate, setStartDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  
  const { data: reports = [], isLoading, refetch } = useDailySalesReport(
    startDate ? `${startDate}T00:00:00.000Z` : undefined,
    endDate ? `${endDate}T23:59:59.999Z` : undefined
  )

  const fetchReports = () => {
    refetch()
  }

  const totalRevenue = reports.reduce((sum, r) => sum + r.total_revenue, 0)
  const totalGST = reports.reduce((sum, r) => sum + r.total_gst, 0)
  const totalInvoices = reports.reduce((sum, r) => sum + r.total_invoices, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Sales Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <div className="flex items-end">
            <Button onClick={fetchReports} disabled={isLoading} className="w-full">
              {isLoading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>
        </div>

        {reports.length > 0 && (
          <>
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">Total GST</p>
                <p className="text-2xl font-bold">{formatCurrency(totalGST)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{totalInvoices}</p>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoices</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">GST</TableHead>
                    <TableHead className="text-right">Gold Value</TableHead>
                    <TableHead className="text-right">Making Charges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.date}>
                      <TableCell>
                        {format(new Date(report.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{report.total_invoices}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.total_revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.total_gst)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.total_gold_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(report.total_making_charges)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {reports.length === 0 && !isLoading && (
          <p className="text-center text-gray-500">No data found for the selected period</p>
        )}
      </CardContent>
    </Card>
  )
}

