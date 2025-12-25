import { NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-api'
import { TABLES } from '@/lib/constants'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    // Verify customer belongs to user
    const { data: customer } = await supabase
      .from(TABLES.CUSTOMERS)
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get invoices for this customer
    const { data: invoices, error: invoicesError } = await supabase
      .from(TABLES.INVOICES)
      .select('*')
      .eq('customer_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (invoicesError) {
      return NextResponse.json({ error: invoicesError.message }, { status: 500 })
    }

    // Get invoice items for each invoice
    const invoicesWithItems = await Promise.all(
      (invoices || []).map(async (invoice) => {
        const { data: items } = await supabase
          .from(TABLES.INVOICE_ITEMS)
          .select(
            `
            *,
            item:${TABLES.ITEMS}(name)
          `
          )
          .eq('invoice_id', invoice.id)

        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          total_amount: parseFloat(invoice.total_amount.toString()),
          created_at: invoice.created_at,
          items: (items || []).map((item: any) => ({
            item_name: item.item?.name || 'Unknown',
            quantity: item.quantity,
            price: parseFloat(item.price.toString()),
          })),
        }
      })
    )

    return NextResponse.json({ data: invoicesWithItems })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

