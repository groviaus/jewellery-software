export type Theme = 'light' | 'dark' | 'system'
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY'

export interface StoreSettings {
  id: string
  user_id: string
  store_name: string
  gst_number: string
  address: string
  gst_rate: number
  stock_alert_threshold?: number
  currency_symbol?: string
  date_format?: DateFormat
  timezone?: string
  theme?: Theme
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface StoreSettingsFormData {
  store_name: string
  gst_number: string
  address: string
  gst_rate: number
  stock_alert_threshold?: number
  currency_symbol?: string
  date_format?: DateFormat
  timezone?: string
  theme?: Theme
  logo_url?: string
}

