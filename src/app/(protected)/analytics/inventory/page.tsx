import InventoryAnalytics from '@/components/analytics/InventoryAnalytics'

export default function InventoryAnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Inventory Analytics</h1>

      <p className="mt-2 text-muted-foreground">
        Analyze stock value, fast/slow-moving items, and turnover rates
      </p>
      <div className="mt-8">
        <InventoryAnalytics />
      </div>
    </div>
  )
}

