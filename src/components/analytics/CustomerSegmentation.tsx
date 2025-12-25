'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/calculations'
import { format } from 'date-fns'
import { useCustomerSegments } from '@/lib/hooks/useAnalytics'
import { Skeleton } from '@/components/ui/skeleton'
import { Crown, User, UserPlus, UserX } from 'lucide-react'

const segmentConfig = {
  VIP: { icon: Crown, color: 'bg-purple-100 text-purple-800', label: 'VIP' },
  Regular: { icon: User, color: 'bg-blue-100 text-blue-800', label: 'Regular' },
  New: { icon: UserPlus, color: 'bg-green-100 text-green-800', label: 'New' },
  Inactive: { icon: UserX, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
}

export default function CustomerSegmentation() {
  const { data: segments = [], isLoading } = useCustomerSegments()

  const segmentCounts = {
    VIP: segments.filter((s) => s.segment === 'VIP').length,
    Regular: segments.filter((s) => s.segment === 'Regular').length,
    New: segments.filter((s) => s.segment === 'New').length,
    Inactive: segments.filter((s) => s.segment === 'Inactive').length,
  }

  const segmentGroups = {
    VIP: segments.filter((s) => s.segment === 'VIP'),
    Regular: segments.filter((s) => s.segment === 'Regular'),
    New: segments.filter((s) => s.segment === 'New'),
    Inactive: segments.filter((s) => s.segment === 'Inactive'),
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Segment Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(segmentConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segmentCounts[key as keyof typeof segmentCounts]}</div>
                <p className="text-xs text-muted-foreground">Customers</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Segment Details */}
      {Object.entries(segmentGroups).map(([segmentKey, segmentList]) => {
        if (segmentList.length === 0) return null

        const config = segmentConfig[segmentKey as keyof typeof segmentConfig]
        const Icon = config.icon

        return (
          <Card key={segmentKey}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {config.label} Customers ({segmentList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead className="text-right">Purchase Count</TableHead>
                    <TableHead className="text-right">Avg Order Value</TableHead>
                    <TableHead className="text-right">Last Purchase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segmentList.map((customer) => (
                    <TableRow key={customer.customer_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {customer.customer_name}
                          <Badge className={config.color}>{config.label}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.total_value)}
                      </TableCell>
                      <TableCell className="text-right">{customer.purchase_count}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(customer.average_order_value)}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.last_purchase_date
                          ? format(new Date(customer.last_purchase_date), 'MMM dd, yyyy')
                          : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

