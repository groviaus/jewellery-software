import { NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-api'
import { TABLES } from '@/lib/constants'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/calculations'

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

    // Get invoice items
    const { data: invoiceItems } = await supabase
      .from(TABLES.INVOICE_ITEMS)
      .select(
        `
        *,
        item:${TABLES.ITEMS}(name, sku, metal_type, purity)
      `
      )
      .eq('invoice_id', id)

    // Get store settings
    const { data: settings } = await supabase
      .from(TABLES.STORE_SETTINGS)
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Generate PDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text(settings?.store_name || 'Jewellery Store', 14, 20)
    doc.setFontSize(10)
    if (settings?.address) {
      doc.text(settings.address, 14, 26)
    }
    if (settings?.gst_number) {
      doc.text(`GST: ${settings.gst_number}`, 14, 30)
    }

    // Invoice title and number
    doc.setFontSize(16)
    doc.text('INVOICE', 160, 20)
    doc.setFontSize(10)
    doc.text(`Invoice #: ${invoice.invoice_number}`, 160, 26)
    doc.text(
      `Date: ${format(new Date(invoice.created_at), 'MMM dd, yyyy')}`,
      160,
      30
    )

    // Customer info
    let yPos = 40
    if (invoice.customer) {
      doc.setFontSize(12)
      doc.text('Bill To:', 14, yPos)
      doc.setFontSize(10)
      doc.text((invoice.customer as any).name, 14, yPos + 6)
      doc.text((invoice.customer as any).phone, 14, yPos + 12)
      yPos += 20
    }

    // Items table
    const tableData = (invoiceItems || []).map((item: any) => [
      item.item?.name || 'N/A',
      item.item?.sku || 'N/A',
      item.weight.toString(),
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity),
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'SKU', 'Weight (g)', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0] },
    })

    const finalY = (doc as any).lastAutoTable.finalY || yPos + 50

    // Totals
    doc.setFontSize(10)
    doc.text('Gold Value:', 140, finalY + 10)
    doc.text(
      formatCurrency(parseFloat(invoice.gold_value.toString())),
      180,
      finalY + 10
    )
    doc.text('Making Charges:', 140, finalY + 16)
    doc.text(
      formatCurrency(parseFloat(invoice.making_charges.toString())),
      180,
      finalY + 16
    )
    doc.text('GST:', 140, finalY + 22)
    doc.text(
      formatCurrency(parseFloat(invoice.gst_amount.toString())),
      180,
      finalY + 22
    )
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Grand Total:', 140, finalY + 30)
    doc.text(
      formatCurrency(parseFloat(invoice.total_amount.toString())),
      180,
      finalY + 30
    )

    // Footer
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text('Thank you for your business!', 105, finalY + 40, {
      align: 'center',
    })

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

