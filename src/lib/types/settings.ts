export interface StoreSettings {
  id: string
  user_id: string
  store_name: string
  gst_number: string
  address: string
  gst_rate: number
  created_at: string
  updated_at: string
}

export interface StoreSettingsFormData {
  store_name: string
  gst_number: string
  address: string
  gst_rate: number
}

