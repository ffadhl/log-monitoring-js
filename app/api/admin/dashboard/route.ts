import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('userId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  // Build where clause
  const where: Record<string, unknown> = {}
  
  if (userId) {
    where.userId = userId
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }
  }

  // Get all logs
  const logs = await prisma.logActivity.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  // Get all employees
  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { logs: true },
      },
    },
  })

  // Calculate stats
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const weeklyLogs = await prisma.logActivity.count({
    where: {
      date: { gte: weekStart, lte: weekEnd },
    },
  })

  const pendingReview = await prisma.logActivity.count({
    where: { status: 'SUBMITTED' },
  })

  const totalDuration = await prisma.logActivity.aggregate({
    _sum: { duration: true },
  })

  // Daily activity for chart (last 7 days)
  const dailyActivity = []
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))

    const count = await prisma.logActivity.count({
      where: {
        date: { gte: dayStart, lte: dayEnd },
      },
    })

    dailyActivity.push({
      date: format(dayStart, 'EEE'),
      count,
    })
  }

  // Leaderboard (most active employees this week)
  const leaderboard = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      logs: {
        where: {
          date: { gte: weekStart, lte: weekEnd },
        },
        select: { duration: true },
      },
    },
  })

  const leaderboardData = leaderboard
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      logCount: user.logs.length,
      totalDuration: user.logs.reduce((acc, log) => acc + log.duration, 0),
    }))
    .sort((a, b) => b.logCount - a.logCount)

  return NextResponse.json({
    logs,
    employees,
    stats: {
      totalLogs: logs.length,
      weeklyLogs,
      pendingReview,
      totalDuration: totalDuration._sum.duration || 0,
      totalEmployees: employees.length,
    },
    dailyActivity,
    leaderboard: leaderboardData,
  })
}
