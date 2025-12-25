'use client'

import { useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { X } from 'lucide-react'
import type { CartItem } from '@/lib/types/billing'
import {
  calculateGoldValue,
  calculateMakingCharges,
  calculateGST,
  calculateGrandTotal,
  formatCurrency,
} from '@/lib/utils/calculations'

interface InvoicePreviewProps {
  cart: CartItem[]
  goldRate: number
  gstRate: number
  onRemoveItem: (itemId: string) => void
  onUpdateItem: (itemId: string, updates: Partial<CartItem>) => void
}

export default function InvoicePreview({
  cart,
  goldRate,
  gstRate,
  onRemoveItem,
  onUpdateItem,
}: InvoicePreviewProps) {
  const totals = useMemo(() => {
    let totalGoldValue = 0
    let totalMakingCharges = 0

    cart.forEach((item) => {
      const goldValue = calculateGoldValue(item.weight, goldRate)
      const makingCharges = calculateMakingCharges(
        item.weight,
        item.item.making_charge
      )

      totalGoldValue += goldValue * item.quantity
      totalMakingCharges += makingCharges * item.quantity
    })

    const gstAmount = calculateGST(totalGoldValue, totalMakingCharges, gstRate)
    const grandTotal = calculateGrandTotal(
      totalGoldValue,
      totalMakingCharges,
      gstAmount
    )

    return {
      goldValue: totalGoldValue,
      makingCharges: totalMakingCharges,
      gstAmount,
      grandTotal,
    }
  }, [cart, goldRate, gstRate])

  // Update item calculations when totals change
  useEffect(() => {
    if (cart.length === 0) return
    
    cart.forEach((item) => {
      const goldValue = calculateGoldValue(item.weight, goldRate)
      const makingCharges = calculateMakingCharges(
        item.weight,
        item.item.making_charge
      )
      const newGoldValue = goldValue
      const newMakingCharges = makingCharges
      const newSubtotal = goldValue + makingCharges
      
      // Only update if values have changed to prevent infinite loops
      if (
        item.gold_value !== newGoldValue ||
        item.making_charges !== newMakingCharges ||
        item.subtotal !== newSubtotal
      ) {
        onUpdateItem(item.item_id, {
          gold_value: newGoldValue,
          making_charges: newMakingCharges,
          subtotal: newSubtotal,
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, goldRate])

  if (cart.length === 0) {
    return <p className="text-center text-gray-500">Cart is empty</p>
  }

  return (
    <div className="space-y-4">
      <div className="max-h-64 overflow-y-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.map((item) => (
              <TableRow key={item.item_id}>
                <TableCell className="font-medium">{item.item.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={item.weight}
                    onChange={(e) =>
                      onUpdateItem(item.item_id, {
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateItem(item.item_id, {
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-16"
                    min="1"
                  />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.subtotal * item.quantity)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.item_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Gold Value:</span>
          <span>{formatCurrency(totals.goldValue)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Making Charges:</span>
          <span>{formatCurrency(totals.makingCharges)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>GST ({gstRate}%):</span>
          <span>{formatCurrency(totals.gstAmount)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-bold">
          <span>Grand Total:</span>
          <span>{formatCurrency(totals.grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}

