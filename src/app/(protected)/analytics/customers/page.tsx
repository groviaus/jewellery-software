import CustomerSegmentation from '@/components/analytics/CustomerSegmentation'

export default function CustomerSegmentationPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Customer Segmentation</h1>

      <p className="mt-2 text-muted-foreground">
        Analyze customer behavior and categorize into VIP, Regular, New, and Inactive segments
      </p>
      <div className="mt-8">
        <CustomerSegmentation />
      </div>
    </div>
  )
}

