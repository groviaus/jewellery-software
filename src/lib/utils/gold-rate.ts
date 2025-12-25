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
 * Fetch current gold rate from API by carat
 * Uses our backend API endpoint to avoid CORS issues
 * @param carat - Optional carat value (22, 18, etc.). If not provided, returns 22K rate by default
 * @returns Gold rate per gram in INR, or null if failed
 */
export async function fetchGoldRateFromAPI(carat?: number): Promise<number | null> {
  try {
    // Call our backend API endpoint
    const url = carat 
      ? `/api/gold-rate?carat=${carat}`
      : '/api/gold-rate?carat=22' // Default to 22K for India
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache to get fresh rates
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && typeof data.rate === 'number') {
      return data.rate
    }

    // If rates object is returned, extract the appropriate carat
    if (data.success && data.rates) {
      const caratKey = carat ? `${carat}K` : '22K'
      if (data.rates[caratKey]) {
        return data.rates[caratKey]
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching gold rate from API:', error)
    return null
  }
}

/**
 * Fetch all gold rates by carat (24K, 22K, 18K, 14K, 10K)
 * @returns Object with rates for each carat, or null if failed
 */
export async function fetchAllGoldRatesByCarat(): Promise<{
  '24K': number
  '22K': number
  '18K': number
  '14K': number
  '10K': number
} | null> {
  try {
    const response = await fetch('/api/gold-rate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.success && data.rates) {
      return data.rates
    }

    return null
  } catch (error) {
    console.error('Error fetching all gold rates from API:', error)
    return null
  }
}

/**
 * Get gold rate from API with error handling
 * @param carat - Optional carat value (22, 18, etc.). Defaults to 22K
 * Returns the rate if successful, null if failed
 */
export async function getGoldRateFromAPI(carat?: number): Promise<{
  rate: number | null
  error: string | null
}> {
  try {
    const rate = await fetchGoldRateFromAPI(carat)
    if (rate === null) {
      return {
        rate: null,
        error: 'Unable to fetch gold rate from API. This may be due to:\n• API service temporarily unavailable\n• Network connectivity issues\n• API key not configured (optional)\n\nPlease enter the gold rate manually or try again later.',
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

