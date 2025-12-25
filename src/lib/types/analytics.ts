export interface InventoryAnalytics {
  stock_value: {
    total: number
    by_metal_type: Record<string, number>
  }
  fast_moving_items: Array<{
    item_id: string
    item_name: string
    sku: string
    metal_type: string
    quantity_sold: number
    times_sold: number
    last_sold_date: string | null
    days_since_last_sale: number | null
  }>
  slow_moving_items: Array<{
    item_id: string
    item_name: string
    sku: string
    metal_type: string
    quantity_sold: number
    times_sold: number
    last_sold_date: string | null
    days_since_last_sale: number | null
  }>
  turnover_rate: number
  total_items_sold: number
  total_items_in_stock: number
  analysis_period_days: number
}

export interface CustomerSegment {
  customer_id: string
  customer_name: string
  phone: string
  total_purchases: number
  total_value: number
  purchase_count: number
  last_purchase_date: string | null
  average_order_value: number
  segment: 'VIP' | 'Regular' | 'New' | 'Inactive'
}

export interface PerformanceMetrics {
  average_transaction_value: number
  total_transactions: number
  total_revenue: number
  conversion_rate: number
  customer_acquisition_rate: number
  period_start: string
  period_end: string
}

