'use client'

import { useMemo, useEffect, useState } from 'react'
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
import { X, Copy, GripVertical, Printer, Save, PieChart } from 'lucide-react'
import RevenueChart from '@/components/charts/RevenueChart'
import { toast } from '@/lib/utils/toast'
import type { CartItem } from '@/lib/types/billing'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
  onReorderItems?: (items: CartItem[]) => void
  onDuplicateItem?: (item: CartItem) => void
}

function SortableCartRow({
  item,
  goldRate,
  onUpdateItem,
  onRemoveItem,
  onDuplicateItem,
}: {
  item: CartItem
  goldRate: number
  onUpdateItem: (itemId: string, updates: Partial<CartItem>) => void
  onRemoveItem: (itemId: string) => void
  onDuplicateItem?: (item: CartItem) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.item_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="font-medium">{item.item.name}</span>
        </div>
      </TableCell>
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
        <div className="flex items-center gap-1">
          {onDuplicateItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicateItem(item)}
              title="Duplicate item"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.item_id)}
            title="Remove item"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function InvoicePreview({
  cart,
  goldRate,
  gstRate,
  onRemoveItem,
  onUpdateItem,
  onReorderItems,
  onDuplicateItem,
}: InvoicePreviewProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [isPrintMode, setIsPrintMode] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && onReorderItems) {
      const oldIndex = cart.findIndex((item) => item.item_id === active.id)
      const newIndex = cart.findIndex((item) => item.item_id === over.id)
      const newCart = arrayMove(cart, oldIndex, newIndex)
      onReorderItems(newCart)
    }
  }

  const handleBulkQuantityUpdate = (quantity: number) => {
    selectedItems.forEach((itemId) => {
      onUpdateItem(itemId, { quantity })
    })
    setSelectedItems(new Set())
  }

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const breakdownData = useMemo(() => {
    return [
      { name: 'Gold Value', value: totals.goldValue },
      { name: 'Making Charges', value: totals.makingCharges },
      { name: 'GST', value: totals.gstAmount },
    ]
  }, [totals])

  const handleSaveDraft = () => {
    const draft = {
      cart,
      goldRate,
      customerId: null, // Will be set from parent
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('invoice_draft', JSON.stringify(draft))
    toast.success('Draft saved', 'Invoice draft saved successfully')
  }

  const handlePrint = () => {
    setIsPrintMode(true)
    setTimeout(() => {
      window.print()
      setIsPrintMode(false)
    }, 100)
  }

  if (cart.length === 0) {
    return <p className="text-center text-gray-500">Cart is empty</p>
  }

  return (
    <div className={`space-y-4 ${isPrintMode ? 'print-mode' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <PieChart className="mr-2 h-4 w-4" />
            {showBreakdown ? 'Hide' : 'Show'} Breakdown
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {showBreakdown && (
        <div className="rounded-md border p-4">
          <h4 className="mb-4 text-sm font-semibold">Revenue Breakdown</h4>
          <RevenueChart data={breakdownData} />
        </div>
      )}
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted p-2">
          <span className="text-sm">
            {selectedItems.size} item(s) selected
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Set quantity"
              className="w-20"
              min="1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement
                  handleBulkQuantityUpdate(parseInt(input.value) || 1)
                  input.value = ''
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="max-h-64 overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext
                items={cart.map((item) => item.item_id)}
                strategy={verticalListSortingStrategy}
              >
                {cart.map((item) => (
                  <SortableCartRow
                    key={item.item_id}
                    item={item}
                    goldRate={goldRate}
                    onUpdateItem={onUpdateItem}
                    onRemoveItem={onRemoveItem}
                    onDuplicateItem={onDuplicateItem}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </div>
      </DndContext>

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

