import { requireAuth } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { TABLES } from '@/lib/constants'
import { notFound } from 'next/navigation'
import CustomerForm from '@/components/customers/CustomerForm'
import { cookies } from 'next/headers'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: customer } = await supabase
    .from(TABLES.CUSTOMERS)
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!customer) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Edit Customer</h1>
      <p className="mt-2 text-gray-600">Update customer information</p>
      <div className="mt-8">
        <CustomerForm initialData={customer} />
      </div>
    </div>
  )
}

