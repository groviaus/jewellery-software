'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Users, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {

  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      <p className="mt-2 text-gray-600">Deep insights into your business performance</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Analytics
            </CardTitle>
            <CardDescription>
              Stock value, fast/slow-moving items, turnover rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics/inventory">
              <Button className="w-full">View Analytics</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Segmentation
            </CardTitle>
            <CardDescription>
              VIP, Regular, New, and Inactive customer analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics/customers">
              <Button className="w-full">View Segmentation</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Transaction value, conversion rate, acquisition metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics/performance">
              <Button className="w-full">View Metrics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

