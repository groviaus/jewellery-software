export interface Customer {
  id: string
  user_id: string
  name: string
  phone: string
  email?: string
  address?: string
  tags?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface CustomerFormData {
  name: string
  phone: string
  email?: string
  address?: string
  tags?: string[]
  notes?: string
}

export interface CustomerPurchaseHistory {
  invoice_id: string
  invoice_number: string
  total_amount: number
  created_at: string
  items: {
    item_name: string
    quantity: number
    price: number
  }[]
}

