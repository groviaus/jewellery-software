import StockSummary from '@/components/reports/StockSummary'

export default function StockSummaryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Stock Summary</h1>
      <p className="mt-2 text-gray-600">Current inventory status</p>
      <div className="mt-8">
        <StockSummary />
      </div>
    </div>
  )
}

