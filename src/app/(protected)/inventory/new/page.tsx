import ItemForm from '@/components/inventory/ItemForm'

export default function NewItemPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Add New Item</h1>
      <p className="mt-2 text-gray-600">Add a new jewellery item to your inventory</p>
      <div className="mt-8">
        <ItemForm />
      </div>
    </div>
  )
}

