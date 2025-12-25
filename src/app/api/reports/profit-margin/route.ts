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

    // Get all invoices with items
    let invoiceQuery = supabase
      .from(TABLES.INVOICES)
      .select(
        `
        *,
        invoice_items(
          *,
          item:jewellery_items(metal_type, net_weight, making_charge)
        )
      `
      )
      .eq('user_id', user.id)

    if (startDate) {
      invoiceQuery = invoiceQuery.gte('created_at', `${startDate}T00:00:00`)
    }
    if (endDate) {
      invoiceQuery = invoiceQuery.lte('created_at', `${endDate}T23:59:59`)
    }

    const { data: invoices, error } = await invoiceQuery.order('created_at', {
      ascending: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate profit margins
    let totalRevenue = 0
    let totalCost = 0
    let totalProfit = 0
    const profitByMetalType: Record<string, { revenue: number; cost: number; profit: number }> = {}

    invoices?.forEach((invoice) => {
      const invoiceRevenue = parseFloat(invoice.total_amount.toString())
      totalRevenue += invoiceRevenue

      let invoiceCost = 0
      if (invoice.invoice_items && Array.isArray(invoice.invoice_items)) {
        invoice.invoice_items.forEach((item: any) => {
          // Estimate cost: 80% of revenue (conservative estimate)
          // In a real scenario, you'd want to track actual cost_price
          const itemRevenue = parseFloat(item.price.toString()) * item.quantity
          const itemCost = itemRevenue * 0.8 // Estimated cost at 80% of revenue
          invoiceCost += itemCost

          const metalType = item.item?.metal_type || 'Unknown'
          if (!profitByMetalType[metalType]) {
            profitByMetalType[metalType] = { revenue: 0, cost: 0, profit: 0 }
          }
          profitByMetalType[metalType].revenue += itemRevenue
          profitByMetalType[metalType].cost += itemCost
          profitByMetalType[metalType].profit += itemRevenue - itemCost
        })
      }

      totalCost += invoiceCost
      totalProfit += invoiceRevenue - invoiceCost
    })

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const profitByMetalArray = Object.entries(profitByMetalType).map(([metalType, data]) => ({
      metal_type: metalType,
      revenue: data.revenue,
      cost: data.cost,
      profit: data.profit,
      margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0,
    }))

    return NextResponse.json({
      data: {
        total_revenue: totalRevenue,
        total_cost: totalCost,
        total_profit: totalProfit,
        profit_margin: profitMargin,
        by_metal_type: profitByMetalArray,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

