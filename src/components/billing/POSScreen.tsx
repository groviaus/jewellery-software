'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ItemSelector from './ItemSelector'
import CustomerSelector from './CustomerSelector'
import InvoicePreview from './InvoicePreview'
import type { CartItem } from '@/lib/types/billing'
import { ShoppingCart, X } from 'lucide-react'
import { useSettings } from '@/lib/hooks/useSettings'
import { useCreateInvoice } from '@/lib/hooks/useInvoices'

export default function POSScreen() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [goldRate, setGoldRate] = useState<string>('')
  const [error, setError] = useState('')

  // Fetch settings using React Query hook
  const { data: settings } = useSettings()
  const gstRate = settings?.gst_rate || 3.0

  const createInvoiceMutation = useCreateInvoice()

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item_id === item.item_id)
      if (existing) {
        return prev.map((i) =>
          i.item_id === item.item_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.item_id !== itemId))
  }

  const updateCartItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((item) =>
        item.item_id === itemId ? { ...item, ...updates } : item
      )
    )
  }, [])

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty')
      return
    }

    if (!goldRate || parseFloat(goldRate) <= 0) {
      setError('Please enter a valid gold rate')
      return
    }

    setError('')

    try {
      const invoice = await createInvoiceMutation.mutateAsync({
        customer_id: customerId,
        items: cart,
        gold_rate: parseFloat(goldRate),
      })

      // Redirect to invoice page
      router.push(`/billing/invoice/${invoice.id}`)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      setError(errorMessage)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Gold Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="gold_rate">Current Gold Rate (₹ per gram)</Label>
              <Input
                id="gold_rate"
                type="number"
                step="0.01"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                placeholder="Enter gold rate"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerSelector
              selectedCustomerId={customerId}
              onSelect={setCustomerId}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemSelector onAddToCart={addToCart} />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <InvoicePreview
              cart={cart}
              goldRate={goldRate ? parseFloat(goldRate) : 0}
              gstRate={gstRate}
              onRemoveItem={removeFromCart}
              onUpdateItem={updateCartItem}
            />

            <div className="mt-6">
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={createInvoiceMutation.isPending || cart.length === 0 || !goldRate}
              >
                {createInvoiceMutation.isPending ? 'Processing...' : 'Generate Invoice'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

