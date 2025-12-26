'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Package, TrendingUp, DollarSign, Award, Receipt } from 'lucide-react'

export default function ReportsPage() {

  return (
    <div>
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="mt-2 text-gray-600">View business reports and analytics</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Sales
            </CardTitle>
            <CardDescription>View daily sales summary</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports/daily">
              <Button className="w-full">View Report</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock Summary
            </CardTitle>
            <CardDescription>Current inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports/stock">
              <Button className="w-full">View Report</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sold Items
            </CardTitle>
            <CardDescription>List of sold items</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports/sold">
              <Button className="w-full">View Report</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Profit Margin
            </CardTitle>
            <CardDescription>Analyze profit margins by metal type</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports/profit-margin">
              <Button className="w-full">View Report</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Selling Items
            </CardTitle>
            <CardDescription>Best performing products</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports/top-selling">
              <Button className="w-full">View Report</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              GST Report
            </CardTitle>
            <CardDescription>GST summary for tax filing</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reports/gst">
              <Button className="w-full">View Report</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

