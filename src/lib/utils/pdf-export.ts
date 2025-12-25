import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface PDFExportOptions {
  title?: string
  filename?: string
  orientation?: 'portrait' | 'landscape'
  unit?: 'mm' | 'pt' | 'px' | 'in'
  format?: 'a4' | 'letter'
}

/**
 * Export data to PDF format
 * @param data Array of objects to export
 * @param columns Column definitions with headers and data keys
 * @param options PDF export options
 */
export function exportToPDF(
  data: Record<string, any>[],
  columns: Array<{ header: string; key: string; width?: number }>,
  options: PDFExportOptions = {}
) {
  const {
    title = 'Report',
    filename = 'report',
    orientation = 'portrait',
    unit = 'mm',
    format = 'a4',
  } = options

  const doc = new jsPDF({
    orientation,
    unit,
    format,
  })

  // Add title
  doc.setFontSize(16)
  doc.text(title, 14, 15)

  // Add date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)

  // Prepare table data
  const tableData = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key]
      if (value === null || value === undefined) return ''
      if (typeof value === 'number') {
        // Format numbers with commas
        return value.toLocaleString('en-IN')
      }
      return String(value)
    })
  )

  const headers = columns.map((col) => col.header)
  const columnWidths = columns.map((col) => col.width || 'auto')

  // Add table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 28,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      if (col.width) {
        acc[index] = { cellWidth: col.width }
      }
      return acc
    }, {} as Record<number, { cellWidth: number }>),
  })

  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Export report data to PDF with default formatting
 */
export function exportReportToPDF(
  data: Record<string, any>[],
  reportTitle: string,
  filename?: string
) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  // Auto-detect columns from first row
  const columns = Object.keys(data[0]).map((key) => ({
    header: key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    key,
  }))

  exportToPDF(data, columns, {
    title: reportTitle,
    filename: filename || reportTitle.toLowerCase().replace(/\s+/g, '-'),
  })
}

