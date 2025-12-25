'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Clock } from 'lucide-react'
import Link from 'next/link'
import { useCustomers } from '@/lib/hooks/useCustomers'
import QuickAddCustomer from './QuickAddCustomer'

interface CustomerSelectorProps {
  selectedCustomerId: string | null
  onSelect: (customerId: string | null) => void
}

export default function CustomerSelector({
  selectedCustomerId,
  onSelect,
}: CustomerSelectorProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const { data: customers = [], isLoading, refetch } = useCustomers()

  // Get recent customers (last 5 based on created_at or last purchase)
  const recentCustomers = useMemo(() => {
    // Sort by created_at descending and take first 5
    return [...customers]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map(c => c.id)
  }, [customers])

  // Separate recent and other customers
  const { recent, others } = useMemo(() => {
    const recentList = customers.filter(c => recentCustomers.includes(c.id))
    const othersList = customers.filter(c => !recentCustomers.includes(c.id))
    return { recent: recentList, others: othersList }
  }, [customers, recentCustomers])

  if (isLoading) {
    return <div>Loading customers...</div>
  }

  const handleValueChange = (value: string) => {
    // Only update if the value actually changed
    const newCustomerId = value === 'walk-in' ? null : value
    if (selectedCustomerId !== newCustomerId) {
      onSelect(newCustomerId)
    }
  }

  const handleCustomerCreated = (customerId: string) => {
    // Refetch customers to get the new one
    refetch()
    // Auto-select the newly created customer
    onSelect(customerId)
  }

  // Always use a controlled value - use 'walk-in' when no customer is selected
  const selectValue = selectedCustomerId || 'walk-in'

  return (
    <>
      <div className="space-y-4">
        <Select 
          value={selectValue} 
          onValueChange={handleValueChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a customer (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="walk-in">Walk-in Customer</SelectItem>
            {recent.length > 0 && (
              <>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent Customers
                </div>
                {recent.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </SelectItem>
                ))}
                {others.length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-1">
                    All Customers
                  </div>
                )}
              </>
            )}
            {others.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setQuickAddOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
          <Link href="/customers/new" target="_blank">
            <Button variant="outline">
              Full Form
            </Button>
          </Link>
        </div>
      </div>
      <QuickAddCustomer
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  )
}

