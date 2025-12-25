'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateCustomer } from '@/lib/hooks/useCustomers'
import { toast } from '@/lib/utils/toast'

const quickAddSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]{10,}$/, 'Phone number must contain only digits'),
})

type QuickAddFormData = z.infer<typeof quickAddSchema>

interface QuickAddCustomerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerCreated: (customerId: string) => void
}

export default function QuickAddCustomer({
  open,
  onOpenChange,
  onCustomerCreated,
}: QuickAddCustomerProps) {
  const createMutation = useCreateCustomer()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickAddFormData>({
    resolver: zodResolver(quickAddSchema),
  })

  const onSubmit = async (data: QuickAddFormData) => {
    try {
      const customer = await createMutation.mutateAsync(data)
      toast.success('Customer added', data.name)
      onCustomerCreated(customer.id)
      reset()
      onOpenChange(false)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create customer'
      toast.error('Error', errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Customer</DialogTitle>
          <DialogDescription>
            Add a new customer quickly. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Name *</Label>
            <Input
              id="quick-name"
              {...register('name')}
              placeholder="Customer name"
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-phone">Phone Number *</Label>
            <Input
              id="quick-phone"
              type="tel"
              {...register('phone')}
              placeholder="9876543210"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

