/**
 * Gold rate management utilities
 * Handles localStorage for gold rate history
 */

const GOLD_RATE_STORAGE_KEY = 'jewellery_gold_rate_history'
const MAX_HISTORY = 5

export interface GoldRateHistory {
  rate: number
  timestamp: string
}

export function getGoldRateHistory(): GoldRateHistory[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(GOLD_RATE_STORAGE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveGoldRate(rate: number): void {
  if (typeof window === 'undefined') return
  
  try {
    const history = getGoldRateHistory()
    const newEntry: GoldRateHistory = {
      rate,
      timestamp: new Date().toISOString(),
    }
    
    // Add to beginning and keep only last MAX_HISTORY entries
    const updated = [newEntry, ...history.filter(h => h.rate !== rate)].slice(0, MAX_HISTORY)
    localStorage.setItem(GOLD_RATE_STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore errors
  }
}

export function getLastGoldRate(): number | null {
  const history = getGoldRateHistory()
  return history.length > 0 ? history[0].rate : null
}

/**
 * Fetch current gold rate from API
 * Uses a free gold rate API service
 * Falls back to manual entry if API fails
 */
export async function fetchGoldRateFromAPI(): Promise<number | null> {
  try {
    // Using a free gold rate API (example: goldapi.io or similar)
    // For production, you should use a paid API service or your own backend
    // This is a placeholder that simulates API call
    
    // Option 1: Use a public API (if available)
    // const response = await fetch('https://api.goldapi.io/api/XAU/INR', {
    //   headers: {
    //     'x-access-token': process.env.NEXT_PUBLIC_GOLD_API_KEY || '',
    //   },
    // })
    
    // Option 2: Use a simpler approach with a free API
    // For now, we'll use a mock that returns a reasonable rate
    // In production, replace this with actual API call
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Mock response - in production, replace with actual API call
    // For Indian gold rates, you might use:
    // - MCX (Multi Commodity Exchange) API
    // - GoldAPI.io
    // - Or your own backend service
    
    // For now, return null to indicate API is not configured
    // User can still manually enter the rate
    return null
    
    // Example implementation when API is available:
    // const response = await fetch('YOUR_GOLD_RATE_API_URL')
    // if (!response.ok) {
    //   throw new Error('Failed to fetch gold rate')
    // }
    // const data = await response.json()
    // return data.rate || data.price || null
  } catch (error) {
    console.error('Error fetching gold rate from API:', error)
    return null
  }
}

/**
 * Get gold rate from API with error handling
 * Returns the rate if successful, null if failed
 */
export async function getGoldRateFromAPI(): Promise<{
  rate: number | null
  error: string | null
}> {
  try {
    const rate = await fetchGoldRateFromAPI()
    if (rate === null) {
      return {
        rate: null,
        error: 'Gold rate API is not configured. Please enter the rate manually.',
      }
    }
    return { rate, error: null }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch gold rate'
    return {
      rate: null,
      error: errorMessage,
    }
  }
}

