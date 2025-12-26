import DailySalesReport from '@/components/reports/DailySalesReport'

export default function DailySalesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Daily Sales Report</h1>

      <p className="mt-2 text-muted-foreground">View daily sales summary and revenue</p>
      <div className="mt-8">
        <DailySalesReport />
      </div>
    </div>
  )
}

