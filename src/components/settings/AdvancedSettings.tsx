'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/lib/utils/toast'
import { Download, Upload, FileText, Database } from 'lucide-react'
import { exportReportToExcel } from '@/lib/utils/excel-export'
import { exportReportToPDF } from '@/lib/utils/pdf-export'

export default function AdvancedSettings() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const response = await fetch('/api/settings/backup')
      if (!response.ok) {
        throw new Error('Failed to create backup')
      }

      const { data } = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Backup created and downloaded successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create backup'
      toast.error('Backup failed', errorMessage)
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    try {
      const text = await file.text()
      const backup = JSON.parse(text)

      // Confirm restore
      const confirmed = window.confirm(
        'WARNING: This will overwrite your existing data. Are you sure you want to continue?'
      )

      if (!confirmed) {
        setIsRestoring(false)
        return
      }

      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore backup')
      }

      toast.success('Backup restored successfully')
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to restore backup'
      toast.error('Restore failed', errorMessage)
    } finally {
      setIsRestoring(false)
      // Reset file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleExportData = async (format: 'json' | 'excel' | 'pdf') => {
    try {
      const response = await fetch('/api/settings/backup')
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const { data } = await response.json()

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Data exported as JSON')
      } else if (format === 'excel') {
        // Export summary data to Excel
        const exportData = [
          {
            'Export Date': new Date().toISOString(),
            'Total Items': data.data.items?.length || 0,
            'Total Customers': data.data.customers?.length || 0,
            'Total Invoices': data.data.invoices?.length || 0,
          },
        ]
        exportReportToExcel(exportData, 'Data Export Summary', 'data-export-summary')
        toast.success('Data summary exported as Excel')
      } else if (format === 'pdf') {
        // Export summary data to PDF
        const exportData = [
          {
            'Export Date': new Date().toISOString().split('T')[0],
            'Total Items': data.data.items?.length || 0,
            'Total Customers': data.data.customers?.length || 0,
            'Total Invoices': data.data.invoices?.length || 0,
          },
        ]
        exportReportToPDF(exportData, 'Data Export Summary', 'data-export-summary')
        toast.success('Data summary exported as PDF')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export data'
      toast.error('Export failed', errorMessage)
    }
  }

  return (
    <div className="space-y-6">
      {/* Backup & Restore */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Restore
          </CardTitle>
          <CardDescription>
            Create backups of your data or restore from a previous backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Create Backup</Label>
            <p className="text-sm text-muted-foreground">
              Download a complete backup of all your data (settings, items, customers, invoices)
            </p>
            <Button onClick={handleBackup} disabled={isBackingUp}>
              <Download className="mr-2 h-4 w-4" />
              {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Restore Backup</Label>
            <p className="text-sm text-muted-foreground">
              Upload a backup file to restore your data. This will overwrite existing data.
            </p>
            <div className="flex items-center gap-2">
                <input
                type="file"
                accept=".json"
                onChange={handleRestore}
                disabled={isRestoring}
                className="hidden"
                id="restore-file"
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRestoring}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isRestoring ? 'Restoring...' : 'Choose File'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export your data in various formats for external use
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button variant="outline" onClick={() => handleExportData('json')}>
              <Download className="mr-2 h-4 w-4" />
              Export as JSON
            </Button>
            <Button variant="outline" onClick={() => handleExportData('excel')}>
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
            <Button variant="outline" onClick={() => handleExportData('pdf')}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

