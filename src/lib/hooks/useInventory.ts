import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Item } from '@/lib/types/inventory'

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: string) => [...inventoryKeys.lists(), { filters }] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
}

// Fetch all items
async function fetchItems(): Promise<Item[]> {
  const response = await fetch('/api/inventory')
  if (!response.ok) {
    throw new Error('Failed to fetch items')
  }
  const data = await response.json()
  return data.data || []
}

// Fetch single item
async function fetchItem(id: string): Promise<Item> {
  const response = await fetch(`/api/inventory/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch item')
  }
  const data = await response.json()
  return data.data
}

// Create item
async function createItem(itemData: Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Item> {
  const response = await fetch('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create item')
  }
  const data = await response.json()
  return data.data
}

// Update item
async function updateItem(id: string, itemData: Partial<Item>): Promise<Item> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update item')
  }
  const data = await response.json()
  return data.data
}

// Delete item
async function deleteItem(id: string): Promise<void> {
  const response = await fetch(`/api/inventory/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete item')
  }
}

// Hooks
export function useInventory() {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: fetchItems,
  })
}

export function useInventoryItem(id: string | null) {
  return useQuery({
    queryKey: inventoryKeys.detail(id!),
    queryFn: () => fetchItem(id!),
    enabled: !!id,
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      // Invalidate and refetch inventory list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      // Also invalidate reports that depend on inventory
      queryClient.invalidateQueries({ queryKey: ['reports', 'stock'] })
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Item> }) => updateItem(id, data),
    onSuccess: (data, variables) => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      // Update specific item cache
      queryClient.setQueryData(inventoryKeys.detail(variables.id), data)
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ['reports', 'stock'] })
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      // Invalidate all detail queries
      queryClient.invalidateQueries({ queryKey: inventoryKeys.details() })
      // Invalidate reports
      queryClient.invalidateQueries({ queryKey: ['reports', 'stock'] })
    },
  })
}

