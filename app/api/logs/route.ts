import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Ambil semua log milik user
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = {
    userId: session.id,
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }
  }

  if (status) {
    where.status = status
  }

  const logs = await prisma.logActivity.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })

  return NextResponse.json(logs)
}

// POST - Buat log baru
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, date, duration, mood } = body

    if (!title || !description || !duration) {
      return NextResponse.json(
        { error: 'Title, description, dan duration harus diisi' },
        { status: 400 }
      )
    }

    const log = await prisma.logActivity.create({
      data: {
        title,
        description,
        date: date ? new Date(date) : new Date(),
        duration: parseInt(duration),
        mood,
        userId: session.id,
        status: 'SUBMITTED',
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Create log error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat log' },
      { status: 500 }
    )
  }
}
