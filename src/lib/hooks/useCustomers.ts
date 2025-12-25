import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Customer } from '@/lib/types/customer'

// Query keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: string) => [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  history: (id: string) => [...customerKeys.detail(id), 'history'] as const,
}

// Fetch all customers
async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch('/api/customers')
  if (!response.ok) {
    throw new Error('Failed to fetch customers')
  }
  const data = await response.json()
  return data.data || []
}

// Fetch single customer
async function fetchCustomer(id: string): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch customer')
  }
  const data = await response.json()
  return data.data
}

// Fetch customer history
async function fetchCustomerHistory(id: string) {
  const response = await fetch(`/api/customers/${id}/history`)
  if (!response.ok) {
    throw new Error('Failed to fetch customer history')
  }
  const data = await response.json()
  return data.data || []
}

// Create customer
async function createCustomer(customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create customer')
  }
  const data = await response.json()
  return data.data
}

// Update customer
async function updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update customer')
  }
  const data = await response.json()
  return data.data
}

// Delete customer
async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete customer')
  }
}

// Hooks
export function useCustomers() {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: fetchCustomers,
  })
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(id!),
    queryFn: () => fetchCustomer(id!),
    enabled: !!id,
  })
}

export function useCustomerHistory(id: string | null) {
  return useQuery({
    queryKey: customerKeys.history(id!),
    queryFn: () => fetchCustomerHistory(id!),
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      // Invalidate and refetch customers list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: (data, variables) => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      // Update specific customer cache
      queryClient.setQueryData(customerKeys.detail(variables.id), data)
      // Invalidate history
      queryClient.invalidateQueries({ queryKey: customerKeys.history(variables.id) })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() })
      // Invalidate all detail queries
      queryClient.invalidateQueries({ queryKey: customerKeys.details() })
    },
  })
}

