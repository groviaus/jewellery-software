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

    let query = supabase
      .from(TABLES.INVOICES)
      .select('*')
      .eq('user_id', user.id)

    if (startDate) {
      query = query.gte('created_at', `${startDate}T00:00:00`)
    }
    if (endDate) {
      query = query.lte('created_at', `${endDate}T23:59:59`)
    }

    const { data: invoices, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by month
    const monthlyData = new Map<string, any>()

    invoices?.forEach((invoice) => {
      const date = new Date(invoice.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const existing = monthlyData.get(monthKey) || {
        month: monthKey,
        total_sales: 0,
        total_gst: 0,
        taxable_amount: 0,
        invoice_count: 0,
      }

      existing.total_sales += parseFloat(invoice.total_amount.toString())
      existing.total_gst += parseFloat(invoice.gst_amount.toString())
      existing.taxable_amount +=
        parseFloat(invoice.total_amount.toString()) -
        parseFloat(invoice.gst_amount.toString())
      existing.invoice_count += 1

      monthlyData.set(monthKey, existing)
    })

    const monthlyArray = Array.from(monthlyData.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    )

    const totalSales = monthlyArray.reduce((sum, m) => sum + m.total_sales, 0)
    const totalGST = monthlyArray.reduce((sum, m) => sum + m.total_gst, 0)
    const totalTaxable = monthlyArray.reduce((sum, m) => sum + m.taxable_amount, 0)

    return NextResponse.json({
      data: {
        monthly_breakdown: monthlyArray,
        summary: {
          total_sales: totalSales,
          total_gst: totalGST,
          total_taxable_amount: totalTaxable,
          total_invoices: invoices?.length || 0,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

