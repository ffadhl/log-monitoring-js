// app/(app)/admin/page.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminClient } from './admin-client'
import { prisma } from '@/lib/prisma'

export default async function AdminPage() {
  const user = await getSession()
  
  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'ADMIN') {
    redirect('/app/dashboard')
  }

  // Fetch initial data
  const [users, managers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            subordinates: true,
            dailyLogs: true,
            weeklyReports: true,
            careerGoals: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'MANAGER'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  return <AdminClient initialUsers={users} managers={managers} />
}
