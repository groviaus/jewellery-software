import { NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-api'
import { TABLES } from '@/lib/constants'

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('*')
      .eq('user_id', user.id)

    if (customersError) {
      return NextResponse.json({ error: customersError.message }, { status: 500 })
    }

    // Get all invoices with customer data
    const { data: invoices, error: invoicesError } = await supabase
      .from(TABLES.INVOICES)
      .select('*')
      .eq('user_id', user.id)

    if (invoicesError) {
      return NextResponse.json({ error: invoicesError.message }, { status: 500 })
    }

    // Calculate customer statistics
    const customerStats = new Map<string, {
      customer_id: string
      customer_name: string
      phone: string
      total_purchases: number
      total_value: number
      purchase_count: number
      last_purchase_date: string | null
      average_order_value: number
    }>()

    // Initialize all customers
    customers?.forEach((customer) => {
      customerStats.set(customer.id, {
        customer_id: customer.id,
        customer_name: customer.name,
        phone: customer.phone,
        total_purchases: 0,
        total_value: 0,
        purchase_count: 0,
        last_purchase_date: null,
        average_order_value: 0,
      })
    })

    // Calculate stats from invoices
    invoices?.forEach((invoice) => {
      if (invoice.customer_id) {
        const stats = customerStats.get(invoice.customer_id)
        if (stats) {
          stats.total_value += parseFloat(invoice.total_amount.toString())
          stats.purchase_count += 1
          stats.total_purchases += 1

          const invoiceDate = invoice.created_at
          if (!stats.last_purchase_date || invoiceDate > stats.last_purchase_date) {
            stats.last_purchase_date = invoiceDate
          }
        }
      }
    })

    // Calculate average order value and segment
    const segments: Array<{
      customer_id: string
      customer_name: string
      phone: string
      total_purchases: number
      total_value: number
      purchase_count: number
      last_purchase_date: string | null
      average_order_value: number
      segment: 'VIP' | 'Regular' | 'New' | 'Inactive'
    }> = []

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    customerStats.forEach((stats) => {
      stats.average_order_value = stats.purchase_count > 0
        ? stats.total_value / stats.purchase_count
        : 0

      let segment: 'VIP' | 'Regular' | 'New' | 'Inactive' = 'New'

      if (stats.purchase_count === 0) {
        segment = 'New'
      } else if (!stats.last_purchase_date) {
        segment = 'Inactive'
      } else {
        const lastPurchaseDate = new Date(stats.last_purchase_date)
        const daysSinceLastPurchase = Math.floor(
          (now.getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysSinceLastPurchase > 90) {
          segment = 'Inactive'
        } else if (stats.total_value >= 100000 || stats.purchase_count >= 10) {
          segment = 'VIP'
        } else if (stats.purchase_count >= 2 || stats.total_value >= 10000) {
          segment = 'Regular'
        } else {
          segment = 'New'
        }
      }

      segments.push({
        ...stats,
        segment,
      })
    })

    // Sort by total value descending
    segments.sort((a, b) => b.total_value - a.total_value)

    return NextResponse.json({ data: segments })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

