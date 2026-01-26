import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/daily-logs/[id] - Fetch a specific daily log
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const log = await prisma.dailyLog.findUnique({
      where: { id },
      include: {
        weeklyReport: true,
      },
    })

    if (!log) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 })
    }

    // Check ownership
    if (log.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Failed to fetch log:', error)
    return NextResponse.json({ error: 'Failed to fetch log' }, { status: 500 })
  }
}

// PUT /api/daily-logs/[id] - Update a daily log
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, mood } = body

    // Find the log
    const existingLog = await prisma.dailyLog.findUnique({
      where: { id },
      include: { weeklyReport: true },
    })

    if (!existingLog) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 })
    }

    // Check ownership
    if (existingLog.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if report is editable
    if (existingLog.weeklyReport && existingLog.weeklyReport.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot edit logs in submitted or reviewed reports' },
        { status: 400 }
      )
    }

    const log = await prisma.dailyLog.update({
      where: { id },
      data: {
        content: content?.trim() || existingLog.content,
        mood: mood !== undefined ? mood : existingLog.mood,
      },
    })

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Failed to update log:', error)
    return NextResponse.json({ error: 'Failed to update log' }, { status: 500 })
  }
}

// DELETE /api/daily-logs/[id] - Delete a daily log
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the log
    const existingLog = await prisma.dailyLog.findUnique({
      where: { id },
      include: { weeklyReport: true },
    })

    if (!existingLog) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 })
    }

    // Check ownership
    if (existingLog.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if report is editable
    if (existingLog.weeklyReport && existingLog.weeklyReport.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot delete logs from submitted or reviewed reports' },
        { status: 400 }
      )
    }

    await prisma.dailyLog.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete log:', error)
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 })
  }
}
