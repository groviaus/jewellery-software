'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Edit, Package, Download, X } from 'lucide-react'
import type { Item } from '@/lib/types/inventory'
import { useState } from 'react'

interface BulkActionsProps {
  selectedItems: Set<string>
  items: Item[]
  onBulkDelete: (itemIds: string[]) => void
  onBulkEdit: (itemIds: string[], updates: Partial<Item>) => void
  onBulkStockUpdate: (itemIds: string[], quantity: number) => void
  onExportSelected: (items: Item[]) => void
  onClearSelection: () => void
}

export default function BulkActions({
  selectedItems,
  items,
  onBulkDelete,
  onBulkEdit,
  onBulkStockUpdate,
  onExportSelected,
  onClearSelection,
}: BulkActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [stockDialogOpen, setStockDialogOpen] = useState(false)
  const [makingCharge, setMakingCharge] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')

  const selectedItemsList = items.filter((item) => selectedItems.has(item.id))

  if (selectedItems.size === 0) {
    return null
  }

  const handleBulkDelete = () => {
    onBulkDelete(Array.from(selectedItems))
    setDeleteDialogOpen(false)
    onClearSelection()
  }

  const handleBulkEdit = () => {
    if (makingCharge) {
      onBulkEdit(Array.from(selectedItems), {
        making_charge: parseFloat(makingCharge),
      })
      setEditDialogOpen(false)
      setMakingCharge('')
      onClearSelection()
    }
  }

  const handleBulkStockUpdate = () => {
    if (stockQuantity) {
      onBulkStockUpdate(Array.from(selectedItems), parseInt(stockQuantity))
      setStockDialogOpen(false)
      setStockQuantity('')
      onClearSelection()
    }
  }

  const handleExportSelected = () => {
    onExportSelected(selectedItemsList)
    onClearSelection()
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-md border bg-muted p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedItems.size} item(s) selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Bulk Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStockDialogOpen(true)}
          >
            <Package className="mr-2 h-4 w-4" />
            Update Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSelected}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Selected
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      </div>

      {/* Bulk Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Items</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedItems.size} item(s)? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit Items</DialogTitle>
            <DialogDescription>
              Update making charge for {selectedItems.size} selected item(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="making_charge">Making Charge (₹ per gram)</Label>
              <Input
                id="making_charge"
                type="number"
                step="0.01"
                value={makingCharge}
                onChange={(e) => setMakingCharge(e.target.value)}
                placeholder="Enter making charge"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkEdit} disabled={!makingCharge}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Stock Update Dialog */}
      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Set stock quantity for {selectedItems.size} selected item(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStockDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkStockUpdate} disabled={!stockQuantity}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

