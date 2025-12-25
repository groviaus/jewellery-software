export interface DashboardWidget {
  id: string
  visible: boolean
  order: number
}

export interface DashboardPreferences {
  widgets: DashboardWidget[]
  dateRange: {
    startDate?: string
    endDate?: string
  }
  lastUpdated?: string
}

const DASHBOARD_PREFS_KEY = 'dashboard_preferences'

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'stats', visible: true, order: 0 },
  { id: 'sales-trend', visible: true, order: 1 },
  { id: 'recent-sales', visible: true, order: 2 },
  { id: 'revenue-comparison', visible: true, order: 3 },
  { id: 'quick-actions', visible: true, order: 4 },
]

export function getDashboardPreferences(): DashboardPreferences {
  if (typeof window === 'undefined') {
    return {
      widgets: DEFAULT_WIDGETS,
      dateRange: {},
    }
  }

  try {
    const stored = localStorage.getItem(DASHBOARD_PREFS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with defaults to handle new widgets
      const mergedWidgets = [...DEFAULT_WIDGETS]
      parsed.widgets?.forEach((storedWidget: DashboardWidget) => {
        const index = mergedWidgets.findIndex((w) => w.id === storedWidget.id)
        if (index >= 0) {
          mergedWidgets[index] = { ...mergedWidgets[index], ...storedWidget }
        }
      })
      return {
        ...parsed,
        widgets: mergedWidgets,
      }
    }
  } catch (error) {
    console.error('Error loading dashboard preferences:', error)
  }

  return {
    widgets: DEFAULT_WIDGETS,
    dateRange: {},
  }
}

export function saveDashboardPreferences(prefs: DashboardPreferences): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(prefs))
  } catch (error) {
    console.error('Error saving dashboard preferences:', error)
  }
}

export function updateWidgetVisibility(widgetId: string, visible: boolean): void {
  const prefs = getDashboardPreferences()
  const widget = prefs.widgets.find((w) => w.id === widgetId)
  if (widget) {
    widget.visible = visible
    saveDashboardPreferences(prefs)
  }
}

export function updateWidgetOrder(widgetIds: string[]): void {
  const prefs = getDashboardPreferences()
  widgetIds.forEach((id, index) => {
    const widget = prefs.widgets.find((w) => w.id === id)
    if (widget) {
      widget.order = index
    }
  })
  saveDashboardPreferences(prefs)
}

export function updateDateRange(startDate?: string, endDate?: string): void {
  const prefs = getDashboardPreferences()
  prefs.dateRange = { startDate, endDate }
  saveDashboardPreferences(prefs)
}

export function updateLastUpdated(): void {
  const prefs = getDashboardPreferences()
  prefs.lastUpdated = new Date().toISOString()
  saveDashboardPreferences(prefs)
}

