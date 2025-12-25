import { NextResponse } from 'next/server'
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/auth-api'
import { TABLES } from '@/lib/constants'

export async function GET() {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    const { data, error } = await supabase
      .from(TABLES.STORE_SETTINGS)
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const {
      store_name,
      gst_number,
      address,
      gst_rate,
      stock_alert_threshold,
      currency_symbol,
      date_format,
      timezone,
      theme,
      logo_url,
    } = body

    if (!store_name) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from(TABLES.STORE_SETTINGS)
      .insert({
        user_id: user.id,
        store_name,
        gst_number: gst_number || null,
        address: address || null,
        gst_rate: gst_rate || 3.0,
        stock_alert_threshold: stock_alert_threshold || null,
        currency_symbol: currency_symbol || '₹',
        date_format: date_format || 'DD/MM/YYYY',
        timezone: timezone || 'Asia/Kolkata',
        theme: theme || 'light',
        logo_url: logo_url || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { user, supabase } = await getAuthenticatedUser()

    if (!user || !supabase) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { store_name, gst_number, address, gst_rate } = body

    if (!store_name) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    // Check if settings exist
    const { data: existing } = await supabase
      .from(TABLES.STORE_SETTINGS)
      .select('id')
      .eq('user_id', user.id)
      .single()

    let data, error

    if (existing) {
      // Update existing
      const result = await supabase
        .from(TABLES.STORE_SETTINGS)
        .update({
          store_name,
          gst_number: gst_number || null,
          address: address || null,
          gst_rate: gst_rate || 3.0,
          stock_alert_threshold: stock_alert_threshold || null,
          currency_symbol: currency_symbol || '₹',
          date_format: date_format || 'DD/MM/YYYY',
          timezone: timezone || 'Asia/Kolkata',
          theme: theme || 'light',
          logo_url: logo_url || null,
        })
        .eq('user_id', user.id)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new
      const result = await supabase
        .from(TABLES.STORE_SETTINGS)
        .insert({
          user_id: user.id,
          store_name,
          gst_number: gst_number || null,
          address: address || null,
          gst_rate: gst_rate || 3.0,
          stock_alert_threshold: stock_alert_threshold || null,
          currency_symbol: currency_symbol || '₹',
          date_format: date_format || 'DD/MM/YYYY',
          timezone: timezone || 'Asia/Kolkata',
          theme: theme || 'light',
          logo_url: logo_url || null,
        })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

