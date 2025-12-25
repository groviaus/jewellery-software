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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StoreSettings, Theme, DateFormat } from '@/lib/types/settings'
import { useCreateSettings, useUpdateSettings } from '@/lib/hooks/useSettings'
import { useTheme } from '@/lib/hooks/useTheme'
import { toast } from '@/lib/utils/toast'
import { Upload, Image as ImageIcon, Moon, Sun, Monitor } from 'lucide-react'
import AdvancedSettings from './AdvancedSettings'

const settingsSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  gst_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
      'Invalid GST number format (e.g., 29ABCDE1234F1Z5)'
    ),
  address: z.string().optional(),
  gst_rate: z
    .number()
    .min(0, 'GST rate must be 0 or greater')
    .max(100, 'GST rate cannot exceed 100%'),
  stock_alert_threshold: z
    .number()
    .min(0, 'Stock alert threshold must be 0 or greater')
    .optional(),
  currency_symbol: z.string().optional(),
  date_format: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']).optional(),
  timezone: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  logo_url: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface TabbedSettingsFormProps {
  initialData?: StoreSettings | null
}

export default function TabbedSettingsForm({ initialData }: TabbedSettingsFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('store-info')

  const createMutation = useCreateSettings()
  const updateMutation = useUpdateSettings()
  const { setTheme: setThemeImmediate } = useTheme()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      store_name: initialData?.store_name || '',
      gst_number: initialData?.gst_number || '',
      address: initialData?.address || '',
      gst_rate: initialData?.gst_rate || 3.0,
      stock_alert_threshold: initialData?.stock_alert_threshold || 5,
      currency_symbol: initialData?.currency_symbol || '₹',
      date_format: (initialData?.date_format || 'DD/MM/YYYY') as DateFormat,
      timezone: initialData?.timezone || 'Asia/Kolkata',
      theme: (initialData?.theme || 'light') as Theme,
      logo_url: initialData?.logo_url || '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        store_name: initialData.store_name,
        gst_number: initialData.gst_number || '',
        address: initialData.address || '',
        gst_rate: initialData.gst_rate,
        stock_alert_threshold: initialData.stock_alert_threshold || 5,
        currency_symbol: initialData.currency_symbol || '₹',
        date_format: (initialData.date_format || 'DD/MM/YYYY') as DateFormat,
        timezone: initialData.timezone || 'Asia/Kolkata',
        theme: (initialData.theme || 'light') as Theme,
        logo_url: initialData.logo_url || '',
      })
    }
  }, [initialData, reset])

  const isLoading = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (data: SettingsFormData) => {
    setError('')
    console.log('Form submitted with data:', data)

    try {
      if (initialData) {
        console.log('Updating existing settings...')
        const result = await updateMutation.mutateAsync(data)
        console.log('Settings updated successfully:', result)
        toast.success('Settings updated successfully', 'Your changes have been saved.')
        // Update form with latest data
        if (result) {
          reset(result)
        }
        // Small delay before refresh to ensure toast is visible
        setTimeout(() => {
          router.refresh()
        }, 500)
      } else {
        console.log('Creating new settings...')
        const result = await createMutation.mutateAsync(data)
        console.log('Settings created successfully:', result)
        toast.success('Settings saved successfully', 'Your settings have been created.')
        // Update form with latest data
        if (result) {
          reset(result)
        }
        // Small delay before refresh to ensure toast is visible
        setTimeout(() => {
          router.refresh()
        }, 500)
      }
    } catch (err) {
      console.error('Settings submission error:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMessage)
      toast.error('Failed to save settings', errorMessage)
    }
  }

  // Handle form validation errors
  const onError = (errors: any) => {
    console.log('Form validation errors:', errors)
    const firstError = Object.values(errors)[0] as any
    if (firstError?.message) {
      toast.error('Validation error', firstError.message)
    } else {
      toast.error('Please fix the form errors', 'Some fields have invalid values')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store-info">Store Info</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
          </div>
        )}

        {/* Store Info Tab */}
        <TabsContent value="store-info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name *</Label>
                <Input
                  id="store_name"
                  {...register('store_name')}
                  placeholder="Enter store name"
                />
                {errors.store_name && (
                  <p className="text-sm text-destructive">{errors.store_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Enter store address"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>
                Configure GST and tax settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <p className="text-xs text-muted-foreground">
                  Format: 29ABCDE1234F1Z5 (15 characters)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gst_rate">GST Rate (%)</Label>
                <Input
                  id="gst_rate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register('gst_rate', { valueAsNumber: true })}
                />
                {errors.gst_rate && (
                  <p className="text-sm text-destructive">{errors.gst_rate.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Default GST rate applied to all invoices
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Configure application preferences and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Store Logo</Label>
                <div className="flex items-center gap-4">
                  {watch('logo_url') ? (
                    <div className="relative">
                      <img
                        src={watch('logo_url')}
                        alt="Store logo"
                        className="h-20 w-20 rounded-md border object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                        onClick={() => {
                          setValue('logo_url', '')
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo_url"
                      {...register('logo_url')}
                      placeholder="Enter logo URL or upload image"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enter a URL to your logo image or upload a file
                    </p>
                  </div>
                </div>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={watch('theme') || 'light'}
                  onValueChange={(value) => {
                    const themeValue = value as Theme
                    setValue('theme', themeValue)
                    // Apply theme immediately for instant feedback
                    // The hook handles errors gracefully and always applies the theme
                    setThemeImmediate(themeValue).catch((err) => {
                      // Only log - theme is already applied
                      console.warn('Theme applied but database update may have failed:', err)
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred color theme
                </p>
              </div>

              {/* Currency Symbol */}
              <div className="space-y-2">
                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                <Input
                  id="currency_symbol"
                  {...register('currency_symbol')}
                  placeholder="₹"
                  maxLength={5}
                />
                {errors.currency_symbol && (
                  <p className="text-sm text-destructive">
                    {errors.currency_symbol.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Symbol used for currency display (e.g., ₹, $, €)
                </p>
              </div>

              {/* Date Format */}
              <div className="space-y-2">
                <Label htmlFor="date_format">Date Format</Label>
                <Select
                  value={watch('date_format') || 'DD/MM/YYYY'}
                  onValueChange={(value) => setValue('date_format', value as DateFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g., 25/12/2024)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (e.g., 12/25/2024)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (e.g., 2024-12-25)</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY (e.g., 25-12-2024)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Format for displaying dates throughout the application
                </p>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={watch('timezone') || 'Asia/Kolkata'}
                  onValueChange={(value) => setValue('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Timezone for date and time display
                </p>
              </div>

              {/* Stock Alert Threshold */}
              <div className="space-y-2">
                <Label htmlFor="stock_alert_threshold">Stock Alert Threshold</Label>
                <Input
                  id="stock_alert_threshold"
                  type="number"
                  min="0"
                  {...register('stock_alert_threshold', { valueAsNumber: true })}
                />
                {errors.stock_alert_threshold && (
                  <p className="text-sm text-destructive">
                    {errors.stock_alert_threshold.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Items with quantity at or below this value will be marked as low stock
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="mt-6">
          <AdvancedSettings />
        </TabsContent>
      </Tabs>

      {activeTab !== 'advanced' && (
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : initialData ? 'Update Settings' : 'Save Settings'}
          </Button>
        </div>
      )}
    </form>
  )
}

