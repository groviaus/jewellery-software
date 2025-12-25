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

    // Group by date
    const dailyData = new Map<string, any>()

    invoices?.forEach((invoice) => {
      const date = new Date(invoice.created_at).toISOString().split('T')[0]
      const existing = dailyData.get(date) || {
        date,
        total_invoices: 0,
        total_revenue: 0,
        total_gst: 0,
        total_gold_value: 0,
        total_making_charges: 0,
      }

      existing.total_invoices += 1
      existing.total_revenue += parseFloat(invoice.total_amount.toString())
      existing.total_gst += parseFloat(invoice.gst_amount.toString())
      existing.total_gold_value += parseFloat(invoice.gold_value.toString())
      existing.total_making_charges += parseFloat(
        invoice.making_charges.toString()
      )

      dailyData.set(date, existing)
    })

    const reports = Array.from(dailyData.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    return NextResponse.json({ data: reports })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

