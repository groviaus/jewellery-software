'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentSales from '@/components/dashboard/RecentSales'
import SalesTrendChart from '@/components/dashboard/SalesTrendChart'
import RevenueComparison from '@/components/dashboard/RevenueComparison'
import DashboardControls from '@/components/dashboard/DashboardControls'
import SortableWidget from '@/components/dashboard/SortableWidget'
import {
  getDashboardPreferences,
  updateWidgetOrder,
  type DashboardWidget,
} from '@/lib/utils/dashboard-preferences'
import { useQueryClient } from '@tanstack/react-query'

interface CustomizableDashboardProps {
  todaySales: number
  totalStock: number
  recentInvoices: any[]
}

export default function CustomizableDashboard({
  todaySales,
  totalStock,
  recentInvoices,
}: CustomizableDashboardProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({})
  const queryClient = useQueryClient()

  useEffect(() => {
    const prefs = getDashboardPreferences()
    setWidgets(prefs.widgets)
    setDateRange(prefs.dateRange)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        updateWidgetOrder(newItems.map((w) => w.id))
        return newItems
      })
    }
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries()
  }

  const handleWidgetVisibilityChange = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets)
  }

  const handleDateRangeChange = (startDate?: string, endDate?: string) => {
    setDateRange({ startDate, endDate })
    queryClient.invalidateQueries()
  }

  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order)

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.id) {
      case 'stats':
        return <StatsCards todaySales={todaySales} totalStock={totalStock} />
      case 'sales-trend':
        return <SalesTrendChart initialInvoices={recentInvoices || []} />
      case 'recent-sales':
        return <RecentSales invoices={recentInvoices || []} />
      case 'revenue-comparison':
        return <RevenueComparison />
      case 'quick-actions':
        return (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <a href="/inventory" className="w-full">
                <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                  View Inventory
                </button>
              </a>
              <a href="/customers" className="w-full">
                <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                  View Customers
                </button>
              </a>
              <a href="/reports" className="w-full">
                <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                  View Reports
                </button>
              </a>
              <a href="/settings" className="w-full">
                <button className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                  Settings
                </button>
              </a>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Group widgets that should be in a grid layout
  const shouldBeInGrid = (widgetId: string) => {
    return widgetId === 'recent-sales' || widgetId === 'revenue-comparison'
  }

  const groupedWidgets: (DashboardWidget | DashboardWidget[])[] = []
  let currentGroup: DashboardWidget[] = []

  visibleWidgets.forEach((widget, index) => {
    if (shouldBeInGrid(widget.id)) {
      currentGroup.push(widget)
      // If this is the last widget or next widget shouldn't be in grid, finalize group
      if (index === visibleWidgets.length - 1 || !shouldBeInGrid(visibleWidgets[index + 1]?.id)) {
        if (currentGroup.length === 1) {
          groupedWidgets.push(currentGroup[0])
        } else {
          groupedWidgets.push([...currentGroup])
        }
        currentGroup = []
      }
    } else {
      if (currentGroup.length > 0) {
        groupedWidgets.push([...currentGroup])
        currentGroup = []
      }
      groupedWidgets.push(widget)
    }
  })

  return (
    <div className="space-y-8">
      <DashboardControls
        onRefresh={handleRefresh}
        onWidgetVisibilityChange={handleWidgetVisibilityChange}
        onDateRangeChange={handleDateRangeChange}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-6">
            {groupedWidgets.map((widgetOrGroup, index) => {
              if (Array.isArray(widgetOrGroup)) {
                // Render grid layout for grouped widgets
                return (
                  <div key={`group-${index}`} className="grid gap-6 lg:grid-cols-2">
                    {widgetOrGroup.map((widget) => (
                      <SortableWidget key={widget.id} id={widget.id}>
                        {renderWidget(widget)}
                      </SortableWidget>
                    ))}
                  </div>
                )
              } else {
                return (
                  <SortableWidget key={widgetOrGroup.id} id={widgetOrGroup.id}>
                    {renderWidget(widgetOrGroup)}
                  </SortableWidget>
                )
              }
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

