import GSTReport from '@/components/reports/GSTReport'

export default function GSTReportPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">GST Report</h1>

      <p className="mt-2 text-muted-foreground">GST summary for tax filing and compliance</p>
      <div className="mt-8">
        <GSTReport />
      </div>
    </div>
  )
}

