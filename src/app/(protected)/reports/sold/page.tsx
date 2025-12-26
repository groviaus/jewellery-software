import SoldItemsReport from '@/components/reports/SoldItemsReport'

export default function SoldItemsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Sold Items Report</h1>

      <p className="mt-2 text-muted-foreground">List of items sold</p>
      <div className="mt-8">
        <SoldItemsReport />
      </div>
    </div>
  )
}

