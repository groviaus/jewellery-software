import { requireAuth } from '@/lib/auth'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ProtectedLayoutWrapper } from '@/components/theme/protected-layout-wrapper'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <ProtectedLayoutWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedLayoutWrapper>
  )
}

