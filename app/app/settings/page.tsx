import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Fetch user with manager info
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      manager: {
        select: { name: true },
      },
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <SettingsClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerName: user.manager?.name,
      }}
    />
  )
}
