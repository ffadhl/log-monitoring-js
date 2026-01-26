import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/weekly-reports - Fetch user's weekly reports
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekNumber = searchParams.get('week')
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    const where: {
      userId: string
      weekNumber?: number
      year?: number
      status?: 'DRAFT' | 'SUBMITTED' | 'REVIEWED'
    } = {
      userId: session.id,
    }

    if (weekNumber) where.weekNumber = parseInt(weekNumber)
    if (year) where.year = parseInt(year)
    if (status) where.status = status as 'DRAFT' | 'SUBMITTED' | 'REVIEWED'

    const reports = await prisma.weeklyReport.findMany({
      where,
      include: {
        dailyLogs: {
          orderBy: { date: 'asc' },
        },
        attachments: true,
      },
      orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

// POST /api/weekly-reports - Create a new weekly report
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { weekNumber, year, startDate, endDate, summary } = body

    if (!weekNumber || !year || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if report already exists
    const existing = await prisma.weeklyReport.findUnique({
      where: {
        userId_weekNumber_year: {
          userId: session.id,
          weekNumber,
          year,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Report for this week already exists' },
        { status: 400 }
      )
    }

    const report = await prisma.weeklyReport.create({
      data: {
        userId: session.id,
        weekNumber,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        summary: summary?.trim() || null,
        status: 'DRAFT',
      },
      include: {
        dailyLogs: true,
        attachments: true,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Failed to create report:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
