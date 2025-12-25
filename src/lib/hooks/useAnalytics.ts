import { useQuery } from '@tanstack/react-query'
import type { InventoryAnalytics, CustomerSegment, PerformanceMetrics } from '@/lib/types/analytics'

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  inventory: (goldRate?: number, days?: number) =>
    [...analyticsKeys.all, 'inventory', { goldRate, days }] as const,
  customers: () => [...analyticsKeys.all, 'customers'] as const,
  performance: (startDate?: string, endDate?: string) =>
    [...analyticsKeys.all, 'performance', { startDate, endDate }] as const,
}

// Fetch inventory analytics
async function fetchInventoryAnalytics(
  goldRate?: number,
  days?: number
): Promise<InventoryAnalytics> {
  const params = new URLSearchParams()
  if (goldRate) params.append('gold_rate', goldRate.toString())
  if (days) params.append('days', days.toString())

  const response = await fetch(`/api/analytics/inventory?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch inventory analytics')
  }
  const data = await response.json()
  return data.data
}

// Fetch customer segments
async function fetchCustomerSegments(): Promise<CustomerSegment[]> {
  const response = await fetch('/api/analytics/customers')
  if (!response.ok) {
    throw new Error('Failed to fetch customer segments')
  }
  const data = await response.json()
  return data.data
}

// Fetch performance metrics
async function fetchPerformanceMetrics(
  startDate?: string,
  endDate?: string
): Promise<PerformanceMetrics> {
  const params = new URLSearchParams()
  if (startDate) params.append('start_date', startDate)
  if (endDate) params.append('end_date', endDate)

  const response = await fetch(`/api/analytics/performance?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch performance metrics')
  }
  const data = await response.json()
  return data.data
}

// Hooks
export function useInventoryAnalytics(goldRate?: number, days?: number) {
  return useQuery({
    queryKey: analyticsKeys.inventory(goldRate, days),
    queryFn: () => fetchInventoryAnalytics(goldRate, days),
  })
}

export function useCustomerSegments() {
  return useQuery({
    queryKey: analyticsKeys.customers(),
    queryFn: fetchCustomerSegments,
  })
}

export function usePerformanceMetrics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: analyticsKeys.performance(startDate, endDate),
    queryFn: () => fetchPerformanceMetrics(startDate, endDate),
  })
}

