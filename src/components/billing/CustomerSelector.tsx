'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useCustomers } from '@/lib/hooks/useCustomers'

interface CustomerSelectorProps {
  selectedCustomerId: string | null
  onSelect: (customerId: string | null) => void
}

export default function CustomerSelector({
  selectedCustomerId,
  onSelect,
}: CustomerSelectorProps) {
  const { data: customers = [], isLoading } = useCustomers()

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

  // Always use a controlled value - use 'walk-in' when no customer is selected
  const selectValue = selectedCustomerId || 'walk-in'

  return (
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
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Link href="/customers/new" target="_blank">
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add New Customer
        </Button>
      </Link>
    </div>
  )
}

