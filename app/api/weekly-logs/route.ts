import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfWeek, endOfWeek, getWeek, getYear } from 'date-fns'

// GET - Ambil semua weekly log milik user
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const year = searchParams.get('year')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {
    userId: session.id,
  }

  if (year) {
    where.year = parseInt(year)
  }

  if (status) {
    where.status = status
  }

  const logs = await prisma.weeklyLog.findMany({
    where,
    orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
    include: {
      user: {
        select: { name: true, email: true },
      },
      attachments: true,
    },
  })

  return NextResponse.json(logs)
}

// POST - Buat weekly log baru
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, summary, totalDuration, mood, weekDate } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title dan description harus diisi' },
        { status: 400 }
      )
    }

    // Calculate week info from the provided date
    const date = weekDate ? new Date(weekDate) : new Date()
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 }) // Sunday
    const weekNumber = getWeek(date, { weekStartsOn: 1 })
    const year = getYear(date)

    // Check if log for this week already exists
    const existingLog = await prisma.weeklyLog.findUnique({
      where: {
        userId_weekNumber_year: {
          userId: session.id,
          weekNumber,
          year,
        },
      },
    })

    if (existingLog) {
      return NextResponse.json(
        { error: 'Log untuk minggu ini sudah ada. Silakan edit log yang sudah ada.' },
        { status: 400 }
      )
    }

    const log = await prisma.weeklyLog.create({
      data: {
        title,
        description,
        summary,
        weekStart,
        weekEnd,
        weekNumber,
        year,
        totalDuration: totalDuration ? parseInt(totalDuration) : 0,
        mood,
        userId: session.id,
        status: 'SUBMITTED',
      },
      include: {
        attachments: true,
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Create weekly log error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat weekly log' },
      { status: 500 }
    )
  }
}
