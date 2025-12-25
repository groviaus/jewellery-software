import { NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-api'
import { TABLES } from '@/lib/constants'

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    // Fetch all user data
    const [settings, items, customers, invoices] = await Promise.all([
      supabase
        .from(TABLES.STORE_SETTINGS)
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from(TABLES.ITEMS)
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from(TABLES.CUSTOMERS)
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from(TABLES.INVOICES)
        .select('*')
        .eq('user_id', user.id),
    ])

    // Get invoice items for all invoices
    const invoiceIds = invoices.data?.map((inv) => inv.id) || []
    let invoiceItems: any[] = []

    if (invoiceIds.length > 0) {
      const { data } = await supabase
        .from(TABLES.INVOICE_ITEMS)
        .select('*')
        .in('invoice_id', invoiceIds)

      invoiceItems = data || []
    }

    const backup = {
      version: '1.0',
      export_date: new Date().toISOString(),
      user_id: user.id,
      data: {
        settings: settings.data,
        items: items.data || [],
        customers: customers.data || [],
        invoices: invoices.data || [],
        invoice_items: invoiceItems,
      },
    }

    return NextResponse.json({ data: backup })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while creating backup' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { backup } = body

    if (!backup || !backup.data) {
      return NextResponse.json(
        { error: 'Invalid backup format' },
        { status: 400 }
      )
    }

    // Validate backup structure
    if (!backup.data.settings || !Array.isArray(backup.data.items) || !Array.isArray(backup.data.customers)) {
      return NextResponse.json(
        { error: 'Invalid backup data structure' },
        { status: 400 }
      )
    }

    // Restore data (this is a simplified version - in production, you'd want more validation)
    // Note: This will overwrite existing data. In production, you might want to:
    // 1. Create a backup before restore
    // 2. Validate data integrity
    // 3. Handle conflicts

    const errors: string[] = []

    // Restore settings
    if (backup.data.settings) {
      const { error: settingsError } = await supabase
        .from(TABLES.STORE_SETTINGS)
        .upsert({
          ...backup.data.settings,
          user_id: user.id, // Ensure user_id matches current user
        })
      if (settingsError) errors.push(`Settings: ${settingsError.message}`)
    }

    // Restore items
    if (backup.data.items && backup.data.items.length > 0) {
      const itemsToInsert = backup.data.items.map((item: any) => ({
        ...item,
        user_id: user.id,
      }))
      const { error: itemsError } = await supabase
        .from(TABLES.ITEMS)
        .upsert(itemsToInsert, { onConflict: 'id' })
      if (itemsError) errors.push(`Items: ${itemsError.message}`)
    }

    // Restore customers
    if (backup.data.customers && backup.data.customers.length > 0) {
      const customersToInsert = backup.data.customers.map((customer: any) => ({
        ...customer,
        user_id: user.id,
      }))
      const { error: customersError } = await supabase
        .from(TABLES.CUSTOMERS)
        .upsert(customersToInsert, { onConflict: 'id' })
      if (customersError) errors.push(`Customers: ${customersError.message}`)
    }

    // Restore invoices (more complex - need to handle invoice items)
    if (backup.data.invoices && backup.data.invoices.length > 0) {
      const invoicesToInsert = backup.data.invoices.map((invoice: any) => ({
        ...invoice,
        user_id: user.id,
      }))
      const { error: invoicesError } = await supabase
        .from(TABLES.INVOICES)
        .upsert(invoicesToInsert, { onConflict: 'id' })
      if (invoicesError) {
        errors.push(`Invoices: ${invoicesError.message}`)
      } else {
        // Restore invoice items
        if (backup.data.invoice_items && backup.data.invoice_items.length > 0) {
          const { error: invoiceItemsError } = await supabase
            .from(TABLES.INVOICE_ITEMS)
            .upsert(backup.data.invoice_items, { onConflict: 'id' })
          if (invoiceItemsError) errors.push(`Invoice Items: ${invoiceItemsError.message}`)
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Partial restore completed with errors', errors },
        { status: 207 } // Multi-Status
      )
    }

    return NextResponse.json({ message: 'Backup restored successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while restoring backup' },
      { status: 500 }
    )
  }
}

