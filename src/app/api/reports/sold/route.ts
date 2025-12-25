import { NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-api'
import { TABLES } from '@/lib/constants'

export async function GET(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const metalType = searchParams.get('metal_type')

    // Build query for invoice items
    let invoiceQuery = supabase
      .from(TABLES.INVOICE_ITEMS)
      .select(
        `
        *,
        invoice:${TABLES.INVOICES}(created_at, user_id, customer_id),
        item:${TABLES.ITEMS}(name, sku, user_id, metal_type)
      `
      )

    // Get all invoice items with item details
    const { data: invoiceItems, error: itemsError } = await invoiceQuery

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Filter by user and additional filters, then group by item
    const soldItemsMap = new Map<string, any>()

    invoiceItems
      ?.filter((item: any) => {
        // Base filter: user must match
        if (item.invoice?.user_id !== user.id || item.item?.user_id !== user.id) {
          return false
        }
        // Filter by customer if specified
        if (customerId && item.invoice?.customer_id !== customerId) {
          return false
        }
        // Filter by metal type if specified
        if (metalType && item.item?.metal_type !== metalType) {
          return false
        }
        return true
      })
      .forEach((item: any) => {
        const itemId = item.item_id
        const existing = soldItemsMap.get(itemId) || {
          item_id: itemId,
          item_name: item.item?.name || 'Unknown',
          sku: item.item?.sku || 'N/A',
          quantity_sold: 0,
          total_revenue: 0,
          last_sold_date: item.invoice?.created_at,
        }

        existing.quantity_sold += item.quantity
        existing.total_revenue += parseFloat(item.price.toString()) * item.quantity

        const itemDate = new Date(item.invoice?.created_at)
        const existingDate = new Date(existing.last_sold_date)
        if (itemDate > existingDate) {
          existing.last_sold_date = item.invoice?.created_at
        }

        soldItemsMap.set(itemId, existing)
      })

    const soldItems = Array.from(soldItemsMap.values()).sort(
      (a, b) =>
        new Date(b.last_sold_date).getTime() - new Date(a.last_sold_date).getTime()
    )

    return NextResponse.json({ data: soldItems })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

