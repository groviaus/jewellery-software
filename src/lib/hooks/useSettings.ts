import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSettingsStore } from '@/lib/store/useStore'
import type { StoreSettings, StoreSettingsFormData } from '@/lib/types/settings'

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  current: () => [...settingsKeys.all, 'current'] as const,
}

// Fetch settings
async function fetchSettings(): Promise<StoreSettings> {
  const response = await fetch('/api/settings')
  if (!response.ok) {
    throw new Error('Failed to fetch settings')
  }
  const data = await response.json()
  return data.data
}

// Create settings
async function createSettings(settingsData: StoreSettingsFormData): Promise<StoreSettings> {
  const response = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create settings')
  }
  const data = await response.json()
  return data.data
}

// Update settings
async function updateSettings(settingsData: StoreSettingsFormData): Promise<StoreSettings> {
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update settings')
  }
  const data = await response.json()
  return data.data
}

// Hooks
export function useSettings() {
  const { setStoreSettings, setLoading, setError } = useSettingsStore()

  return useQuery({
    queryKey: settingsKeys.current(),
    queryFn: async () => {
      setLoading(true)
      setError(null)
      try {
        const settings = await fetchSettings()
        setStoreSettings(settings)
        return settings
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings'
        setError(errorMessage)
        throw error
      } finally {
        setLoading(false)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - settings don't change often
  })
}

export function useCreateSettings() {
  const queryClient = useQueryClient()
  const { setStoreSettings } = useSettingsStore()

  return useMutation({
    mutationFn: createSettings,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(settingsKeys.current(), data)
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() })
      // Update Zustand store
      setStoreSettings(data)
    },
    onError: (error) => {
      console.error('Failed to create settings:', error)
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const { setStoreSettings } = useSettingsStore()

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(settingsKeys.current(), data)
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() })
      // Update Zustand store
      setStoreSettings(data)
    },
    onError: (error) => {
      console.error('Failed to update settings:', error)
    },
  })
}

