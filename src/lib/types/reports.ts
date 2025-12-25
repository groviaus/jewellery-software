export interface DailySalesReport {
  date: string
  total_invoices: number
  total_revenue: number
  total_gst: number
  total_gold_value: number
  total_making_charges: number
}

export interface StockSummary {
  total_items: number
  total_quantity: number
  total_gold_items: number
  total_silver_items: number
  total_diamond_items: number
  low_stock_items: number
}

export interface SoldItem {
  item_id: string
  item_name: string
  sku: string
  quantity_sold: number
  total_revenue: number
  last_sold_date: string
}

