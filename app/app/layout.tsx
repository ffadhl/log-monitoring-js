import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AppSidebar } from '@/components/app-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <AppSidebar
      user={{
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      }}
    >
      {children}
    </AppSidebar>
  )
}
