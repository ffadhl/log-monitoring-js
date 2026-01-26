import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CareerClient } from './career-client'

export default async function CareerPage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  // Fetch career goals
  const goals = await prisma.careerGoal.findMany({
    where: { userId: session.id },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return <CareerClient goals={goals} />
}
