import TopSellingItemsReport from '@/components/reports/TopSellingItemsReport'

export default function TopSellingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Top Selling Items</h1>
      <p className="mt-2 text-gray-600">View your best performing products</p>
      <div className="mt-8">
        <TopSellingItemsReport />
      </div>
    </div>
  )
}

