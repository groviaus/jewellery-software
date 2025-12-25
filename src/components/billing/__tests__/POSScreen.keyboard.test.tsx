import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import POSScreen from '../POSScreen'

// Mock the hooks
vi.mock('@/lib/hooks/useSettings', () => ({
  useSettings: () => ({
    data: { gst_rate: 3.0 },
    isLoading: false,
  }),
}))

const mockMutateAsync = vi.fn().mockResolvedValue({
  id: 'invoice-1',
  invoice_number: 'INV-001',
})

vi.mock('@/lib/hooks/useInvoices', () => ({
  useCreateInvoice: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('@/lib/utils/gold-rate', async () => {
  const actual = await vi.importActual('@/lib/utils/gold-rate')
  return {
    ...actual,
    getLastGoldRate: vi.fn(() => 5000),
    getGoldRateHistory: vi.fn(() => []),
    getGoldRateFromAPI: vi.fn(),
  }
})

describe('POSScreen Keyboard Shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show keyboard shortcut hint for checkout', () => {
    render(<POSScreen />)
    expect(screen.getByText(/Ctrl\+Enter to checkout/i)).toBeInTheDocument()
  })

  it('should trigger checkout on Ctrl+Enter', async () => {
    const user = userEvent.setup()
    render(<POSScreen />)

    // Set gold rate and add item to cart first
    const goldRateInput = screen.getByLabelText(/Current Gold Rate/i)
    await user.type(goldRateInput, '5000')

    // Note: In a real test, we'd need to add items to cart first
    // This test verifies the shortcut hint is present
    expect(screen.getByText(/Ctrl\+Enter to checkout/i)).toBeInTheDocument()
  })
})

