import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { TABLES } from '@/lib/constants'
import StoreSettingsForm from '@/components/settings/StoreSettingsForm'
import { cookies } from 'next/headers'

export default async function SettingsPage() {
  const user = await requireAuth()
  
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )

  // Fetch existing settings
  const { data: settings, error } = await supabase
    .from(TABLES.STORE_SETTINGS)
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your store information and GST settings
        </p>
      </div>
      <div className="mt-8">
        {error && error.code !== 'PGRST116' ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <p>Error loading settings: {error.message}</p>
          </div>
        ) : (
          <StoreSettingsForm initialData={settings} />
        )}
      </div>
    </div>
  )
}

