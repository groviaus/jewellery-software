import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { TABLES } from '@/lib/constants'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import InventoryTable from '@/components/inventory/InventoryTable'
import { cookies } from 'next/headers'

export default async function InventoryPage() {
  const user = await requireAuth()
  
  // Create Supabase client with token for data fetching
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

  const { data: items, error } = await supabase
    .from(TABLES.ITEMS)
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching items:', error)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="mt-2 text-gray-600">Manage your jewellery items</p>
        </div>
        <Link href="/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>
      <div className="mt-8">
        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <p>Error loading inventory: {error.message}</p>
          </div>
        ) : (
          <InventoryTable items={items || []} />
        )}
      </div>
    </div>
  )
}

