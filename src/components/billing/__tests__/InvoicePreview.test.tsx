import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@/test/utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvoicePreview from '../InvoicePreview'
import type { CartItem } from '@/lib/types/billing'

const mockCartItem: CartItem = {
  item_id: 'item-1',
  item: {
    id: 'item-1',
    name: 'Gold Ring',
    sku: 'GR001',
    metal_type: 'Gold',
    purity: '22K',
    net_weight: 5,
    making_charge: 500,
    quantity: 10,
  },
  quantity: 1,
  weight: 5,
  gold_value: 25000,
  making_charges: 500,
  subtotal: 25500,
}

describe('InvoicePreview', () => {
  const defaultProps = {
    cart: [mockCartItem],
    goldRate: 5000,
    gstRate: 3.0,
    onRemoveItem: vi.fn(),
    onUpdateItem: vi.fn(),
    onReorderItems: vi.fn(),
    onDuplicateItem: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render breakdown chart button', () => {
    render(<InvoicePreview {...defaultProps} />)
    expect(screen.getByText(/Show Breakdown/i)).toBeInTheDocument()
  })

  it('should toggle breakdown chart', async () => {
    const user = userEvent.setup()
    render(<InvoicePreview {...defaultProps} />)

    const breakdownButton = screen.getByText(/Show Breakdown/i)
    await user.click(breakdownButton)

    expect(screen.getByText(/Hide Breakdown/i)).toBeInTheDocument()
  })

  it('should render save draft button', () => {
    render(<InvoicePreview {...defaultProps} />)
    expect(screen.getByText(/Save Draft/i)).toBeInTheDocument()
  })

  it('should render print button', () => {
    render(<InvoicePreview {...defaultProps} />)
    expect(screen.getByText(/Print/i)).toBeInTheDocument()
  })

  it('should call onDuplicateItem when duplicate button is clicked', async () => {
    const user = userEvent.setup()
    render(<InvoicePreview {...defaultProps} />)

    const duplicateButton = screen.getByTitle('Duplicate item')
    await user.click(duplicateButton)

    expect(defaultProps.onDuplicateItem).toHaveBeenCalledWith(mockCartItem)
  })
})

