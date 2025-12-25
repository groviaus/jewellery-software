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

    // Get invoice with customer
    const { data: invoice, error: invoiceError } = await supabase
      .from(TABLES.INVOICES)
      .select(
        `
        *,
        customer:${TABLES.CUSTOMERS}(name, phone)
      `
      )
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Get invoice items with item details
    const { data: invoiceItems, error: itemsError } = await supabase
      .from(TABLES.INVOICE_ITEMS)
      .select(
        `
        *,
        item:${TABLES.ITEMS}(name, sku, metal_type, purity)
      `
      )
      .eq('invoice_id', id)

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        ...invoice,
        items: invoiceItems || [],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

