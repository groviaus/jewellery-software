import CustomerForm from '@/components/customers/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Add New Customer</h1>
      <p className="mt-2 text-gray-600">Add a new customer to your database</p>
      <div className="mt-8">
        <CustomerForm />
      </div>
    </div>
  )
}

