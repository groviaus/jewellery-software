import SetupForm from '@/components/auth/SetupForm'

export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <SetupForm />
      </div>
    </div>
  )
}

