import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import InventoryTable from '../InventoryTable'
import type { Item } from '@/lib/types/inventory'

const mockItems: Item[] = Array.from({ length: 25 }, (_, i) => ({
  id: `item-${i}`,
  user_id: 'user-1',
  name: `Item ${i + 1}`,
  sku: `SKU${i + 1}`,
  metal_type: i % 2 === 0 ? 'Gold' : 'Silver',
  purity: '22K',
  net_weight: 5 + i,
  gross_weight: 6 + i,
  making_charge: 500 + i,
  quantity: 10 - i,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}))

vi.mock('@/lib/hooks/useInventory', () => ({
  useInventory: () => ({
    data: mockItems,
    isLoading: false,
  }),
  useDeleteInventoryItem: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
  useUpdateInventoryItem: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
  }),
}))

describe('InventoryTable UX', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display pagination when items exceed items per page', () => {
    render(<InventoryTable items={mockItems} />)
    expect(screen.getByText(/Showing 1 to 10 of 25 items/i)).toBeInTheDocument()
  })

  it('should change items per page', async () => {
    const user = userEvent.setup()
    render(<InventoryTable items={mockItems} />)

    const itemsPerPageSelect = screen.getByText(/10 per page/i)
    await user.click(itemsPerPageSelect)

    const option25 = screen.getByText(/25 per page/i)
    await user.click(option25)

    expect(screen.getByText(/Showing 1 to 25 of 25 items/i)).toBeInTheDocument()
  })

  it('should show column visibility dropdown', async () => {
    const user = userEvent.setup()
    render(<InventoryTable items={mockItems} />)

    const columnsButton = screen.getByText(/Columns/i)
    await user.click(columnsButton)

    expect(screen.getByText(/Toggle Columns/i)).toBeInTheDocument()
    expect(screen.getByText(/Name/i)).toBeInTheDocument()
    expect(screen.getByText(/SKU/i)).toBeInTheDocument()
  })

  it('should toggle column visibility', async () => {
    const user = userEvent.setup()
    render(<InventoryTable items={mockItems} />)

    const columnsButton = screen.getByText(/Columns/i)
    await user.click(columnsButton)

    const nameCheckbox = screen.getByRole('checkbox', { name: /Name/i })
    await user.click(nameCheckbox)

    // Column should be hidden (tested via visibleColumns state)
    expect(nameCheckbox).not.toBeChecked()
  })

  it('should enable inline editing on double click', async () => {
    const user = userEvent.setup()
    render(<InventoryTable items={mockItems} />)

    const quantityCell = screen.getAllByText(/10/i)[0]
    await user.dblClick(quantityCell)

    const input = screen.getByDisplayValue('10')
    expect(input).toBeInTheDocument()
  })
})

