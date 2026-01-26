import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeekStart, getWeekEnd, getWeekNumber, getYearNumber } from '@/lib/date-utils'

// GET /api/daily-logs - Fetch user's daily logs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekNumber = searchParams.get('week')
    const year = searchParams.get('year')
    const limit = searchParams.get('limit')

    const where: { userId: string; date?: { gte: Date; lte: Date } } = {
      userId: session.id,
    }

    // Filter by week if provided
    if (weekNumber && year) {
      const startDate = getWeekStart(new Date(`${year}-01-01`))
      // Adjust to correct week
      startDate.setDate(startDate.getDate() + (parseInt(weekNumber) - 1) * 7)
      const endDate = getWeekEnd(startDate)
      where.date = { gte: startDate, lte: endDate }
    }

    const logs = await prisma.dailyLog.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

// POST /api/daily-logs - Create a new daily log
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, content, mood, weekNumber, year } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const logDate = new Date(date)
    const wn = weekNumber || getWeekNumber(logDate)
    const yr = year || getYearNumber(logDate)

    // Find or create weekly report for this week
    let weeklyReport = await prisma.weeklyReport.findUnique({
      where: {
        userId_weekNumber_year: {
          userId: session.id,
          weekNumber: wn,
          year: yr,
        },
      },
    })

    if (!weeklyReport) {
      const startDate = getWeekStart(logDate)
      const endDate = getWeekEnd(logDate)

      weeklyReport = await prisma.weeklyReport.create({
        data: {
          userId: session.id,
          weekNumber: wn,
          year: yr,
          startDate,
          endDate,
          status: 'DRAFT',
        },
      })
    }

    // Check if report is still editable
    if (weeklyReport.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot add logs to submitted or reviewed reports' },
        { status: 400 }
      )
    }

    // Create the daily log
    const log = await prisma.dailyLog.create({
      data: {
        date: logDate,
        content: content.trim(),
        mood: mood || null,
        userId: session.id,
        weeklyReportId: weeklyReport.id,
      },
    })

    return NextResponse.json({ log, weeklyReport }, { status: 201 })
  } catch (error) {
    console.error('Failed to create log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}
