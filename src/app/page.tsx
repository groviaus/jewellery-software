import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    // Check if any users exist by trying to query (we'll redirect to setup if needed)
    // For now, redirect to login - user can go to /setup if no account exists
    redirect('/login')
  }
}