import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { TABLES } from '@/lib/constants'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import InvoiceList from '@/components/billing/InvoiceList'
import { cookies } from 'next/headers'

export default async function InvoicesPage() {
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

  // Get all invoices
  const { data: invoices, error } = await supabase
    .from(TABLES.INVOICES)
    .select(
      `
      *,
      customer:${TABLES.CUSTOMERS}(name, phone)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Invoices</h1>
          <p className="mt-2 text-gray-600">View and manage all generated invoices</p>
        </div>
        <Link href="/billing">
          <Button>
            Create New Invoice
          </Button>
        </Link>
      </div>

      <div className="mt-8">
        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <p>Error loading invoices: {error.message}</p>
          </div>
        ) : (
          <InvoiceList invoices={invoices || []} />
        )}
      </div>
    </div>
  )
}

