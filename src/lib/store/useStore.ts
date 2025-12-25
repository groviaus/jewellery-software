import { create } from 'zustand'
import { createSettingsSlice, type SettingsSlice } from './slices/settingsSlice'

interface StoreState {
  settings: SettingsSlice
}

type StoreActions = {
  // Settings actions are accessed via settings slice
}

export type Store = StoreState & StoreActions

export const useStore = create<Store>((set, get) => ({
  settings: {
    ...createSettingsSlice(),
    setStoreSettings: (settings) =>
      set((state) => ({
        settings: { ...state.settings, storeSettings: settings },
      })),
    setLoading: (loading) =>
      set((state) => ({
        settings: { ...state.settings, isLoading: loading },
      })),
    setError: (error) =>
      set((state) => ({
        settings: { ...state.settings, error },
      })),
    reset: () =>
      set((state) => ({
        settings: createSettingsSlice(),
      })),
  },
}))

// Convenience hooks
export const useSettingsStore = () => useStore((state) => state.settings)

