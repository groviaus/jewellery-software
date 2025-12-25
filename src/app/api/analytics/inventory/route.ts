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
    const goldRate = parseFloat(searchParams.get('gold_rate') || '0')
    const days = parseInt(searchParams.get('days') || '90') // Default 90 days for movement analysis

    // Get all items
    const { data: items, error: itemsError } = await supabase
      .from(TABLES.ITEMS)
      .select('*')
      .eq('user_id', user.id)

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Get all invoice items for the specified period
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data: invoiceItems, error: invoiceItemsError } = await supabase
      .from(TABLES.INVOICE_ITEMS)
      .select(
        `
        *,
        invoice:${TABLES.INVOICES}(created_at, user_id),
        item:${TABLES.ITEMS}(id, user_id)
      `
      )
      .gte('invoice.created_at', cutoffDate.toISOString())

    if (invoiceItemsError) {
      return NextResponse.json({ error: invoiceItemsError.message }, { status: 500 })
    }

    // Filter invoice items by user
    const userInvoiceItems = invoiceItems?.filter(
      (item: any) => item.invoice?.user_id === user.id && item.item?.user_id === user.id
    ) || []

    // Calculate stock value
    let totalStockValue = 0
    const stockValueByMetal: Record<string, number> = {}

    items?.forEach((item) => {
      // Estimate value: (net_weight * gold_rate) + making_charge
      // For non-gold items, use a base value
      let itemValue = 0
      if (item.metal_type === 'Gold' && goldRate > 0) {
        itemValue = item.net_weight * goldRate + item.making_charge
      } else if (item.metal_type === 'Silver') {
        // Silver rate is typically much lower, estimate at 1/100th of gold
        itemValue = item.net_weight * (goldRate / 100) + item.making_charge
      } else {
        // Diamond - use making charge as base value
        itemValue = item.making_charge * 10 // Rough estimate
      }

      const totalItemValue = itemValue * item.quantity
      totalStockValue += totalItemValue

      if (!stockValueByMetal[item.metal_type]) {
        stockValueByMetal[item.metal_type] = 0
      }
      stockValueByMetal[item.metal_type] += totalItemValue
    })

    // Analyze item movement
    const itemMovementMap = new Map<string, {
      item_id: string
      item_name: string
      sku: string
      metal_type: string
      quantity_sold: number
      times_sold: number
      last_sold_date: string | null
      days_since_last_sale: number | null
    }>()

    // Initialize all items
    items?.forEach((item) => {
      itemMovementMap.set(item.id, {
        item_id: item.id,
        item_name: item.name,
        sku: item.sku,
        metal_type: item.metal_type,
        quantity_sold: 0,
        times_sold: 0,
        last_sold_date: null,
        days_since_last_sale: null,
      })
    })

    // Calculate sales for each item
    userInvoiceItems.forEach((invoiceItem: any) => {
      const itemId = invoiceItem.item_id
      const movement = itemMovementMap.get(itemId)
      if (movement) {
        movement.quantity_sold += invoiceItem.quantity
        movement.times_sold += 1

        const saleDate = new Date(invoiceItem.invoice?.created_at)
        if (!movement.last_sold_date || saleDate > new Date(movement.last_sold_date)) {
          movement.last_sold_date = invoiceItem.invoice?.created_at
          const daysSince = Math.floor(
            (new Date().getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24)
          )
          movement.days_since_last_sale = daysSince
        }
      }
    })

    const itemMovements = Array.from(itemMovementMap.values())

    // Categorize items
    const fastMoving = itemMovements
      .filter((item) => item.times_sold >= 3 || item.quantity_sold >= 10)
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 10)

    const slowMoving = itemMovements
      .filter((item) => item.times_sold === 0 || (item.days_since_last_sale && item.days_since_last_sale > 60))
      .sort((a, b) => {
        if (a.times_sold === 0 && b.times_sold === 0) return 0
        if (a.times_sold === 0) return 1
        if (b.times_sold === 0) return -1
        return (b.days_since_last_sale || 0) - (a.days_since_last_sale || 0)
      })
      .slice(0, 10)

    // Calculate turnover rate (items sold / total items in period)
    const totalItemsSold = itemMovements.reduce((sum, item) => sum + item.quantity_sold, 0)
    const totalItemsInStock = items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const turnoverRate = totalItemsInStock > 0 
      ? (totalItemsSold / (totalItemsInStock + totalItemsSold)) * 100 
      : 0

    return NextResponse.json({
      data: {
        stock_value: {
          total: totalStockValue,
          by_metal_type: stockValueByMetal,
        },
        fast_moving_items: fastMoving,
        slow_moving_items: slowMoving,
        turnover_rate: turnoverRate,
        total_items_sold: totalItemsSold,
        total_items_in_stock: totalItemsInStock,
        analysis_period_days: days,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

