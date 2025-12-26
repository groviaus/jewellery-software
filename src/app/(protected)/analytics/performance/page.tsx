import PerformanceMetrics from '@/components/analytics/PerformanceMetrics'

export default function PerformanceMetricsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Performance Metrics</h1>

      <p className="mt-2 text-muted-foreground">
        Track key performance indicators including transaction value, conversion rate, and customer acquisition
      </p>
      <div className="mt-8">
        <PerformanceMetrics />
      </div>
    </div>
  )
}

