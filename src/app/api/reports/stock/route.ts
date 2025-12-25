import { NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-api'
import { TABLES } from '@/lib/constants'

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    const { data: items, error } = await supabase
      .from(TABLES.ITEMS)
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const summary = {
      total_items: items?.length || 0,
      total_quantity: items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      total_gold_items: items?.filter((item) => item.metal_type === 'Gold').length || 0,
      total_silver_items: items?.filter((item) => item.metal_type === 'Silver').length || 0,
      total_diamond_items: items?.filter((item) => item.metal_type === 'Diamond').length || 0,
      low_stock_items: items?.filter((item) => item.quantity < 5).length || 0,
    }

    return NextResponse.json({ data: summary })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

