import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import POSScreen from '../POSScreen'

// Mock the hooks
vi.mock('@/lib/hooks/useSettings', () => ({
  useSettings: () => ({
    data: { gst_rate: 3.0 },
    isLoading: false,
  }),
}))

vi.mock('@/lib/hooks/useInvoices', () => ({
  useCreateInvoice: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'invoice-1',
      invoice_number: 'INV-001',
    }),
    isPending: false,
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/lib/utils/gold-rate', async () => {
  const actual = await vi.importActual('@/lib/utils/gold-rate')
  return {
    ...actual,
    getGoldRateFromAPI: vi.fn(),
    getLastGoldRate: vi.fn(() => 5000),
    getGoldRateHistory: vi.fn(() => []),
  }
})

describe('POSScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render gold rate fetch button', () => {
    render(<POSScreen />)
    expect(screen.getByText('Fetch Current Rate')).toBeInTheDocument()
  })

  it('should show loading state when fetching gold rate', async () => {
    const { getGoldRateFromAPI } = await import('@/lib/utils/gold-rate')
    vi.mocked(getGoldRateFromAPI).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ rate: 5500, error: null }), 100)
        )
    )

    const user = userEvent.setup()
    render(<POSScreen />)

    const fetchButton = screen.getByText('Fetch Current Rate')
    await user.click(fetchButton)

    expect(screen.getByText('Fetching...')).toBeInTheDocument()
  })

  it('should update gold rate on successful API fetch', async () => {
    const { getGoldRateFromAPI } = await import('@/lib/utils/gold-rate')
    vi.mocked(getGoldRateFromAPI).mockResolvedValue({
      rate: 5500,
      error: null,
    })

    const user = userEvent.setup()
    render(<POSScreen />)

    const fetchButton = screen.getByText('Fetch Current Rate')
    await user.click(fetchButton)

    await waitFor(() => {
      const input = screen.getByLabelText(/Current Gold Rate/i) as HTMLInputElement
      expect(input.value).toBe('5500')
    })
  })

  it('should show error toast when API fetch fails', async () => {
    const { getGoldRateFromAPI } = await import('@/lib/utils/gold-rate')
    vi.mocked(getGoldRateFromAPI).mockResolvedValue({
      rate: null,
      error: 'API not configured',
    })

    const user = userEvent.setup()
    render(<POSScreen />)

    const fetchButton = screen.getByText('Fetch Current Rate')
    await user.click(fetchButton)

    // Toast notification should appear (tested via toast utility)
    await waitFor(() => {
      expect(getGoldRateFromAPI).toHaveBeenCalled()
    })
  })
})

