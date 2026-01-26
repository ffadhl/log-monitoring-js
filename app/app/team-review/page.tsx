import { redirect } from 'next/navigation'
import { getSession, isManager } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TeamReviewClient } from './team-review-client'

export default async function TeamReviewPage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Only managers and admins can access this page
  if (!isManager(session.role)) {
    redirect('/app/dashboard')
  }

  // Fetch subordinates with their data
  const subordinates = await prisma.user.findMany({
    where: { managerId: session.id },
    include: {
      weeklyReports: {
        orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
        take: 5,
      },
      careerGoals: {
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          dailyLogs: true,
          weeklyReports: true,
          careerGoals: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Fetch pending reviews (submitted reports from subordinates)
  const pendingReports = await prisma.weeklyReport.findMany({
    where: {
      status: 'SUBMITTED',
      user: {
        managerId: session.id,
      },
    },
    include: {
      user: true,
      dailyLogs: {
        orderBy: { date: 'asc' },
      },
    },
    orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
  })

  return (
    <TeamReviewClient
      subordinates={subordinates}
      pendingReports={pendingReports}
    />
  )
}
