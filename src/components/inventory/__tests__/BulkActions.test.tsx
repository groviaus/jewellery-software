import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import BulkActions from '../BulkActions'
import type { Item } from '@/lib/types/inventory'

const mockItems: Item[] = [
  {
    id: 'item-1',
    user_id: 'user-1',
    name: 'Gold Ring',
    sku: 'GR001',
    metal_type: 'Gold',
    purity: '22K',
    net_weight: 5,
    gross_weight: 6,
    making_charge: 500,
    quantity: 10,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'item-2',
    user_id: 'user-1',
    name: 'Silver Chain',
    sku: 'SC001',
    metal_type: 'Silver',
    purity: '925',
    net_weight: 10,
    gross_weight: 12,
    making_charge: 300,
    quantity: 5,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
]

describe('BulkActions', () => {
  const defaultProps = {
    selectedItems: new Set(['item-1', 'item-2']),
    items: mockItems,
    onBulkDelete: vi.fn(),
    onBulkEdit: vi.fn(),
    onBulkStockUpdate: vi.fn(),
    onExportSelected: vi.fn(),
    onClearSelection: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when no items selected', () => {
    const { container } = render(
      <BulkActions {...defaultProps} selectedItems={new Set()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render when items are selected', () => {
    render(<BulkActions {...defaultProps} />)
    expect(screen.getByText(/2 item\(s\) selected/i)).toBeInTheDocument()
  })

  it('should show bulk delete button', () => {
    render(<BulkActions {...defaultProps} />)
    expect(screen.getByText(/Delete Selected/i)).toBeInTheDocument()
  })

  it('should show bulk edit button', () => {
    render(<BulkActions {...defaultProps} />)
    expect(screen.getByText(/Bulk Edit/i)).toBeInTheDocument()
  })

  it('should show update stock button', () => {
    render(<BulkActions {...defaultProps} />)
    expect(screen.getByText(/Update Stock/i)).toBeInTheDocument()
  })

  it('should show export selected button', () => {
    render(<BulkActions {...defaultProps} />)
    expect(screen.getByText(/Export Selected/i)).toBeInTheDocument()
  })

  it('should open delete dialog on delete button click', async () => {
    const user = userEvent.setup()
    render(<BulkActions {...defaultProps} />)

    const deleteButton = screen.getByText(/Delete Selected/i)
    await user.click(deleteButton)

    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument()
  })

  it('should call onBulkDelete when confirmed', async () => {
    const user = userEvent.setup()
    render(<BulkActions {...defaultProps} />)

    const deleteButton = screen.getByText(/Delete Selected/i)
    await user.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: /^Delete$/i })
    await user.click(confirmButton)

    expect(defaultProps.onBulkDelete).toHaveBeenCalledWith(['item-1', 'item-2'])
  })
})

