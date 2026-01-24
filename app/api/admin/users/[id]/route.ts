import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // Get user info
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  }

  // Build where clause for logs
  const where: Record<string, unknown> = { userId: id }
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }
  }

  // Get user's logs
  const logs = await prisma.logActivity.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  // Calculate stats
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const weeklyLogs = await prisma.logActivity.count({
    where: {
      userId: id,
      date: { gte: weekStart, lte: weekEnd },
    },
  })

  const reviewedLogs = await prisma.logActivity.count({
    where: { userId: id, status: 'REVIEWED' },
  })

  const pendingLogs = await prisma.logActivity.count({
    where: { userId: id, status: 'SUBMITTED' },
  })

  const totalDuration = await prisma.logActivity.aggregate({
    where: { userId: id },
    _sum: { duration: true },
  })

  // Daily activity for chart (last 14 days)
  const dailyActivity = []
  for (let i = 13; i >= 0; i--) {
    const date = subDays(now, i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const dayLogs = await prisma.logActivity.findMany({
      where: {
        userId: id,
        date: { gte: dayStart, lte: dayEnd },
      },
      select: { duration: true },
    })

    dailyActivity.push({
      date: format(dayStart, 'dd/MM'),
      count: dayLogs.length,
      duration: dayLogs.reduce((acc, log) => acc + log.duration, 0),
    })
  }

  // Mood distribution
  const moodCounts = await prisma.logActivity.groupBy({
    by: ['mood'],
    where: { userId: id, mood: { not: null } },
    _count: true,
  })

  return NextResponse.json({
    user,
    logs,
    stats: {
      totalLogs: logs.length,
      weeklyLogs,
      reviewedLogs,
      pendingLogs,
      totalDuration: totalDuration._sum.duration || 0,
    },
    dailyActivity,
    moodDistribution: moodCounts,
  })
}
