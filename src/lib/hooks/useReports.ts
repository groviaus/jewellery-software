import { useQuery } from '@tanstack/react-query'
import type { DailySalesReport, SoldItemsReport, StockSummary } from '@/lib/types/reports'

// Query keys
export const reportKeys = {
  all: ['reports'] as const,
  daily: (from?: string, to?: string) => [...reportKeys.all, 'daily', { from, to }] as const,
  sold: (from?: string, to?: string) => [...reportKeys.all, 'sold', { from, to }] as const,
  stock: () => [...reportKeys.all, 'stock'] as const,
}

// Fetch daily sales report
async function fetchDailySalesReport(from?: string, to?: string): Promise<DailySalesReport> {
  const params = new URLSearchParams()
  if (from) params.append('from', from)
  if (to) params.append('to', to)

  const response = await fetch(`/api/reports/daily?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch daily sales report')
  }
  const data = await response.json()
  return data.data
}

// Fetch sold items report
async function fetchSoldItemsReport(from?: string, to?: string): Promise<SoldItemsReport> {
  const params = new URLSearchParams()
  if (from) params.append('from', from)
  if (to) params.append('to', to)

  const response = await fetch(`/api/reports/sold?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch sold items report')
  }
  const data = await response.json()
  return data.data
}

// Fetch stock summary
async function fetchStockSummary(): Promise<StockSummary> {
  const response = await fetch('/api/reports/stock')
  if (!response.ok) {
    throw new Error('Failed to fetch stock summary')
  }
  const data = await response.json()
  return data.data
}

// Hooks
export function useDailySalesReport(from?: string, to?: string) {
  return useQuery({
    queryKey: reportKeys.daily(from, to),
    queryFn: () => fetchDailySalesReport(from, to),
  })
}

export function useSoldItemsReport(from?: string, to?: string) {
  return useQuery({
    queryKey: reportKeys.sold(from, to),
    queryFn: () => fetchSoldItemsReport(from, to),
  })
}

export function useStockSummary() {
  return useQuery({
    queryKey: reportKeys.stock(),
    queryFn: fetchStockSummary,
  })
}

