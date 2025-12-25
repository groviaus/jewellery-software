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
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get all invoice items with item details
    let invoiceQuery = supabase
      .from(TABLES.INVOICE_ITEMS)
      .select(
        `
        *,
        invoice:${TABLES.INVOICES}(created_at, user_id),
        item:${TABLES.ITEMS}(name, sku, metal_type, user_id)
      `
      )

    const { data: invoiceItems, error: itemsError } = await invoiceQuery

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Filter by user and date range, then group by item
    const itemsMap = new Map<string, any>()

    invoiceItems
      ?.filter((item: any) => {
        if (item.invoice?.user_id !== user.id || item.item?.user_id !== user.id) {
          return false
        }
        if (startDate) {
          const itemDate = new Date(item.invoice?.created_at).toISOString().split('T')[0]
          if (itemDate < startDate) return false
        }
        if (endDate) {
          const itemDate = new Date(item.invoice?.created_at).toISOString().split('T')[0]
          if (itemDate > endDate) return false
        }
        return true
      })
      .forEach((item: any) => {
        const itemId = item.item_id
        const existing = itemsMap.get(itemId) || {
          item_id: itemId,
          item_name: item.item?.name || 'Unknown',
          sku: item.item?.sku || 'N/A',
          metal_type: item.item?.metal_type || 'Unknown',
          quantity_sold: 0,
          total_revenue: 0,
          times_sold: 0,
        }

        existing.quantity_sold += item.quantity
        existing.total_revenue += parseFloat(item.price.toString()) * item.quantity
        existing.times_sold += 1

        itemsMap.set(itemId, existing)
      })

    const topItems = Array.from(itemsMap.values())
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, limit)

    return NextResponse.json({ data: topItems })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

