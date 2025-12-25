'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Filter, Save, X, Trash2 } from 'lucide-react'
import type { Item } from '@/lib/types/inventory'

const FILTER_PRESETS_KEY = 'inventory_filter_presets'

export interface FilterPreset {
  id: string
  name: string
  filters: {
    searchQuery?: string
    metalType?: string
    purity?: string
    minWeight?: number
    maxWeight?: number
    minQuantity?: number
    maxQuantity?: number
    stockStatus?: string
  }
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: FilterPreset['filters']) => void
  onClearFilters: () => void
}

export default function AdvancedFilters({
  onApplyFilters,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const [currentFilters, setCurrentFilters] = useState<FilterPreset['filters']>({
    searchQuery: '',
    metalType: 'all',
    purity: '',
    minWeight: undefined,
    maxWeight: undefined,
    minQuantity: undefined,
    maxQuantity: undefined,
    stockStatus: 'all',
  })
  const [presetName, setPresetName] = useState('')

  useEffect(() => {
    // Load saved presets from localStorage
    const saved = localStorage.getItem(FILTER_PRESETS_KEY)
    if (saved) {
      try {
        setPresets(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading filter presets:', error)
      }
    }
  }, [])

  const savePreset = () => {
    if (!presetName.trim()) return

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName,
      filters: { ...currentFilters },
    }
    const updated = [...presets, newPreset]
    setPresets(updated)
    localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(updated))
    setPresetName('')
  }

  const deletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id)
    setPresets(updated)
    localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(updated))
  }

  const loadPreset = (preset: FilterPreset) => {
    setCurrentFilters(preset.filters)
    onApplyFilters(preset.filters)
  }

  const handleApply = () => {
    onApplyFilters(currentFilters)
    setIsOpen(false)
  }

  const handleClear = () => {
    setCurrentFilters({
      searchQuery: '',
      metalType: 'all',
      purity: '',
      minWeight: undefined,
      maxWeight: undefined,
      minQuantity: undefined,
      maxQuantity: undefined,
      stockStatus: 'all',
    })
    onClearFilters()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="mr-2 h-4 w-4" />
        Advanced Filters
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>
              Set up complex filters and save them as presets for quick access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Saved Presets */}
            {presets.length > 0 && (
              <div className="space-y-2">
                <Label>Saved Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center gap-1 rounded-md border bg-muted px-3 py-1.5 text-sm"
                    >
                      <button
                        onClick={() => loadPreset(preset)}
                        className="hover:underline"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={() => deletePreset(preset.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Query</Label>
                <Input
                  id="search"
                  value={currentFilters.searchQuery || ''}
                  onChange={(e) =>
                    setCurrentFilters({ ...currentFilters, searchQuery: e.target.value })
                  }
                  placeholder="Search items..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metalType">Metal Type</Label>
                <Select
                  value={currentFilters.metalType || 'all'}
                  onValueChange={(value) =>
                    setCurrentFilters({ ...currentFilters, metalType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Diamond">Diamond</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purity">Purity</Label>
                <Input
                  id="purity"
                  value={currentFilters.purity || ''}
                  onChange={(e) =>
                    setCurrentFilters({ ...currentFilters, purity: e.target.value })
                  }
                  placeholder="e.g., 22K, 18K"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockStatus">Stock Status</Label>
                <Select
                  value={currentFilters.stockStatus || 'all'}
                  onValueChange={(value) =>
                    setCurrentFilters({ ...currentFilters, stockStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minWeight">Min Weight (g)</Label>
                <Input
                  id="minWeight"
                  type="number"
                  step="0.001"
                  value={currentFilters.minWeight || ''}
                  onChange={(e) =>
                    setCurrentFilters({
                      ...currentFilters,
                      minWeight: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Minimum"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxWeight">Max Weight (g)</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  step="0.001"
                  value={currentFilters.maxWeight || ''}
                  onChange={(e) =>
                    setCurrentFilters({
                      ...currentFilters,
                      maxWeight: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Maximum"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minQuantity">Min Quantity</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={currentFilters.minQuantity || ''}
                  onChange={(e) =>
                    setCurrentFilters({
                      ...currentFilters,
                      minQuantity: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Minimum"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxQuantity">Max Quantity</Label>
                <Input
                  id="maxQuantity"
                  type="number"
                  value={currentFilters.maxQuantity || ''}
                  onChange={(e) =>
                    setCurrentFilters({
                      ...currentFilters,
                      maxQuantity: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Maximum"
                />
              </div>
            </div>

            {/* Save Preset */}
            <div className="flex items-end gap-2">
              <div className="flex-1 gap-2">
                <Label htmlFor="presetName">Save as Preset</Label>
                <Input
                  id="presetName"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && presetName.trim()) {
                      savePreset()
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={savePreset}
                disabled={!presetName.trim()}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClear}>
              Clear All
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

