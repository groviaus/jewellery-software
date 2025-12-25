import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if any users already exist
    const {
      data: { user: existingUser },
    } = await supabase.auth.getUser()

    // For MVP, we'll allow setup if no user exists
    // In production, you might want to add additional checks

    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // If email confirmation is disabled, user is immediately available
    // If enabled, user needs to confirm email first
    return NextResponse.json({
      user: data.user,
      message: data.user
        ? 'Account created successfully'
        : 'Account created. Please check your email to confirm your account.',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred during setup' },
      { status: 500 }
    )
  }
}

