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

    // Default to last 30 days if not specified
    const defaultEndDate = new Date()
    const defaultStartDate = new Date(defaultEndDate)
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)

    const periodStart = startDate || defaultStartDate.toISOString().split('T')[0]
    const periodEnd = endDate || defaultEndDate.toISOString().split('T')[0]

    // Get invoices for the period
    let invoiceQuery = supabase
      .from(TABLES.INVOICES)
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', `${periodStart}T00:00:00`)
      .lte('created_at', `${periodEnd}T23:59:59`)

    const { data: invoices, error: invoicesError } = await invoiceQuery.order('created_at', {
      ascending: false,
    })

    if (invoicesError) {
      return NextResponse.json({ error: invoicesError.message }, { status: 500 })
    }

    // Calculate metrics
    const totalTransactions = invoices?.length || 0
    const totalRevenue = invoices?.reduce(
      (sum, inv) => sum + parseFloat(inv.total_amount.toString()),
      0
    ) || 0
    const averageTransactionValue = totalTransactions > 0
      ? totalRevenue / totalTransactions
      : 0

    // Get unique customers who made purchases in this period
    const customerIds = new Set(
      invoices?.map((inv) => inv.customer_id).filter((id) => id !== null) || []
    )

    // Get total customers (for acquisition rate calculation)
    const { data: allCustomers } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('id, created_at')
      .eq('user_id', user.id)

    const totalCustomers = allCustomers?.length || 0
    const newCustomersInPeriod = allCustomers?.filter((customer) => {
      const customerDate = new Date(customer.created_at).toISOString().split('T')[0]
      return customerDate >= periodStart && customerDate <= periodEnd
    }).length || 0

    // Calculate customer acquisition rate
    const customerAcquisitionRate = totalCustomers > 0
      ? (newCustomersInPeriod / totalCustomers) * 100
      : 0

    // Conversion rate (transactions per customer)
    // This is a simplified metric - in a real scenario, you'd track visits/leads
    const activeCustomers = customerIds.size
    const conversionRate = activeCustomers > 0
      ? (totalTransactions / activeCustomers)
      : 0

    return NextResponse.json({
      data: {
        average_transaction_value: averageTransactionValue,
        total_transactions: totalTransactions,
        total_revenue: totalRevenue,
        conversion_rate: conversionRate,
        customer_acquisition_rate: customerAcquisitionRate,
        period_start: periodStart,
        period_end: periodEnd,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

