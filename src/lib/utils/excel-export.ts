import * as XLSX from 'xlsx'

export interface ExcelExportOptions {
  sheetName?: string
  filename?: string
}

/**
 * Export data to Excel format
 * @param data Array of objects to export
 * @param options Excel export options
 */
export function exportToExcel(
  data: Record<string, any>[],
  options: ExcelExportOptions = {}
) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  const { sheetName = 'Sheet1', filename = 'export' } = options

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Set column widths
  const maxWidth = 50
  const wscols = Object.keys(data[0]).map((key) => ({
    wch: Math.min(
      Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      ),
      maxWidth
    ),
  }))
  worksheet['!cols'] = wscols

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Generate Excel file and download
  XLSX.writeFile(
    workbook,
    `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`
  )
}

/**
 * Export report data to Excel with default formatting
 */
export function exportReportToExcel(
  data: Record<string, any>[],
  reportTitle: string,
  filename?: string
) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  exportToExcel(data, {
    sheetName: reportTitle.substring(0, 31), // Excel sheet name limit
    filename: filename || reportTitle.toLowerCase().replace(/\s+/g, '-'),
  })
}

