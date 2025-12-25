'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StoreSettings } from '@/lib/types/settings'
import { useCreateSettings, useUpdateSettings } from '@/lib/hooks/useSettings'

const settingsSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  gst_number: z.string().optional(),
  address: z.string().optional(),
  gst_rate: z.number().min(0).max(100),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface StoreSettingsFormProps {
  initialData?: StoreSettings | null
}

export default function StoreSettingsForm({ initialData }: StoreSettingsFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const createMutation = useCreateSettings()
  const updateMutation = useUpdateSettings()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      store_name: initialData?.store_name || '',
      gst_number: initialData?.gst_number || '',
      address: initialData?.address || '',
      gst_rate: initialData?.gst_rate || 3.0,
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        store_name: initialData.store_name,
        gst_number: initialData.gst_number || '',
        address: initialData.address || '',
        gst_rate: initialData.gst_rate,
      })
    }
  }, [initialData, reset])

  const isLoading = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (data: SettingsFormData) => {
    setError('')
    setSuccess(false)

    try {
      if (initialData) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }

      setSuccess(true)
      router.refresh()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMessage)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Store Information</CardTitle>
        <CardDescription>
          Update your store details and GST configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-700">
              Settings saved successfully!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name *</Label>
            <Input
              id="store_name"
              {...register('store_name')}
              placeholder="Ramesh Jewellery"
            />
            {errors.store_name && (
              <p className="text-sm text-destructive">{errors.store_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_number">GST Number</Label>
            <Input
              id="gst_number"
              {...register('gst_number')}
              placeholder="29ABCDE1234F1Z5"
            />
            {errors.gst_number && (
              <p className="text-sm text-destructive">{errors.gst_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="123 Main Street, City, State - 123456"
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_rate">GST Rate (%) *</Label>
            <Input
              id="gst_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('gst_rate', { valueAsNumber: true })}
              placeholder="3.0"
            />
            {errors.gst_rate && (
              <p className="text-sm text-destructive">{errors.gst_rate.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Default GST rate for jewellery is 3%
            </p>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

