import ProfitMarginReport from '@/components/reports/ProfitMarginReport'

export default function ProfitMarginPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Profit Margin Analysis</h1>
      <p className="mt-2 text-gray-600">Analyze profit margins by metal type and overall performance</p>
      <div className="mt-8">
        <ProfitMarginReport />
      </div>
    </div>
  )
}

