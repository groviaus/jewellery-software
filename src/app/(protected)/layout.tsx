import { requireAuth } from '@/lib/auth'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ProtectedLayoutWrapper } from '@/components/theme/protected-layout-wrapper'
import { BackButton } from '@/components/ui/back-button'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <ProtectedLayoutWrapper>
      <SidebarProvider className="h-svh overflow-hidden">
        <AppSidebar />
        <SidebarInset className="overflow-hidden h-full">
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <BackButton />
          </header>
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedLayoutWrapper>
  )
}

