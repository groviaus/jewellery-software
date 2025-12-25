import { NextResponse } from 'next/server'

/**
 * Calculate gold rate by carat based on 24K (pure gold) rate
 * @param baseRate24K - Rate for 24K gold per gram
 * @param carat - Carat value (22, 18, 14, 10, etc.)
 * @returns Rate for the specified carat
 */
function calculateRateByCarat(baseRate24K: number, carat: number): number {
  // Carat represents purity: 24K = 100% pure, 22K = 91.67%, 18K = 75%, etc.
  const purity = carat / 24
  return baseRate24K * purity
}

/**
 * API route to fetch current gold rate by carat
 * Uses FREE public APIs that don't require registration or payment:
 * 1. ExchangeRate-API.com (free, no API key needed)
 * 2. Public gold price sources
 * 3. Market estimate fallback
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const carat = searchParams.get('carat') // Optional: specific carat (22, 18, etc.)

    // Step 1: Fetch USD to INR exchange rate (FREE - no API key required)
    let usdToInr = 83 // Default fallback
    try {
      const usdToInrResponse = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { 
          next: { revalidate: 3600 }, // Cache for 1 hour
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (usdToInrResponse.ok) {
        const usdToInrData = await usdToInrResponse.json()
        usdToInr = usdToInrData.rates?.INR || 83
      }
    } catch (e) {
      console.log('Exchange rate API failed, using default:', e)
    }

    // Step 2: Try to fetch gold price from public sources
    let goldUsdPerOunce: number | null = null
    let source = 'Market Estimate'

    // Try multiple free public endpoints
    const publicEndpoints = [
      // Try exchangerate-api with XAU (Gold) symbol
      'https://api.exchangerate-api.com/v4/latest/XAU',
      // Try alternative public gold price endpoints
      'https://api.fixer.io/latest?base=XAU&symbols=USD',
    ]

    for (const endpoint of publicEndpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json',
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        })

        if (response.ok) {
          const data = await response.json()
          
          // Handle different response formats
          if (data.rates && data.rates.USD) {
            // If XAU is base, USD rate gives us ounces per USD, so invert
            goldUsdPerOunce = 1 / data.rates.USD
            source = 'ExchangeRate-API'
            break
          } else if (data.price) {
            goldUsdPerOunce = data.price
            source = 'Public API'
            break
          } else if (data.spot) {
            goldUsdPerOunce = data.spot
            source = 'Public API'
            break
          }
        }
      } catch (e) {
        // Continue to next endpoint
        continue
      }
    }

    // If we couldn't get real-time data, use current market estimate
    // Current gold price (Jan 2024): ~$2,000-2,500 per ounce
    // We'll use a reasonable estimate that's updated periodically
    if (!goldUsdPerOunce) {
      // Try to get a more accurate estimate by checking recent trends
      // For now, using a conservative estimate
      goldUsdPerOunce = 2400 // Approximate current market rate (can be updated)
      source = 'Market Estimate'
    }

    // Convert to INR per gram for 24K (pure gold)
    // 1 troy ounce = 31.1035 grams
    const inrPerGram24K = (goldUsdPerOunce * usdToInr) / 31.1035

    // Calculate rates for different carats
    const rates = {
      '24K': Math.round(inrPerGram24K * 100) / 100,
      '22K': Math.round(calculateRateByCarat(inrPerGram24K, 22) * 100) / 100,
      '18K': Math.round(calculateRateByCarat(inrPerGram24K, 18) * 100) / 100,
      '14K': Math.round(calculateRateByCarat(inrPerGram24K, 14) * 100) / 100,
      '10K': Math.round(calculateRateByCarat(inrPerGram24K, 10) * 100) / 100,
    }

    // If specific carat requested, return only that
    if (carat) {
      const caratNum = parseInt(carat)
      if (caratNum && [24, 22, 18, 14, 10].includes(caratNum)) {
        return NextResponse.json({
          success: true,
          rate: rates[`${caratNum}K` as keyof typeof rates],
          carat: `${caratNum}K`,
          currency: 'INR',
          unit: 'gram',
          source: `${source} (Free)`,
          timestamp: new Date().toISOString(),
          note: source === 'Market Estimate' 
            ? 'Using market estimate. For real-time rates, consider using a dedicated gold price API.'
            : undefined,
        })
      }
    }

    return NextResponse.json({
      success: true,
      rates,
      baseRate24K: Math.round(inrPerGram24K * 100) / 100,
      currency: 'INR',
      unit: 'gram',
      source: `${source} (Free)`,
      timestamp: new Date().toISOString(),
      note: source === 'Market Estimate' 
        ? 'Using market estimate based on current exchange rates. For real-time rates, consider using a dedicated gold price API.'
        : undefined,
    })
  } catch (error) {
    console.error('Error fetching gold rate:', error)
    
    // Final fallback: Return approximate rates based on current market average
    // Current approximate gold rate in India (Jan 2024): ~₹6,500-7,000 per gram for 24K
    const approximateRate24K = 6750
    const rates = {
      '24K': approximateRate24K,
      '22K': Math.round(calculateRateByCarat(approximateRate24K, 22) * 100) / 100,
      '18K': Math.round(calculateRateByCarat(approximateRate24K, 18) * 100) / 100,
      '14K': Math.round(calculateRateByCarat(approximateRate24K, 14) * 100) / 100,
      '10K': Math.round(calculateRateByCarat(approximateRate24K, 10) * 100) / 100,
    }

    if (carat) {
      const caratNum = parseInt(carat)
      if (caratNum && [24, 22, 18, 14, 10].includes(caratNum)) {
        return NextResponse.json({
          success: true,
          rate: rates[`${caratNum}K` as keyof typeof rates],
          carat: `${caratNum}K`,
          currency: 'INR',
          unit: 'gram',
          note: 'Approximate rate - APIs unavailable. Please verify manually.',
          timestamp: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      rates,
      baseRate24K: approximateRate24K,
      currency: 'INR',
      unit: 'gram',
      note: 'Approximate rates - APIs unavailable. Please verify manually.',
      timestamp: new Date().toISOString(),
    })
  }
}
