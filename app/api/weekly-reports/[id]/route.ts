import { NextRequest, NextResponse } from 'next/server'
import { getSession, isManager } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/weekly-reports/[id] - Fetch a specific weekly report
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const report = await prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        user: true,
        dailyLogs: {
          orderBy: { date: 'asc' },
        },
        attachments: true,
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check access - owner or their manager
    const isOwner = report.userId === session.id
    const isReportManager =
      isManager(session.role) && report.user.managerId === session.id

    if (!isOwner && !isReportManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to fetch report:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}

// PUT /api/weekly-reports/[id] - Update a weekly report
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { summary } = body

    // Find the report
    const existingReport = await prisma.weeklyReport.findUnique({
      where: { id },
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check ownership
    if (existingReport.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if report is editable
    if (existingReport.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot edit submitted or reviewed reports' },
        { status: 400 }
      )
    }

    const report = await prisma.weeklyReport.update({
      where: { id },
      data: {
        summary: summary?.trim() || null,
      },
      include: {
        dailyLogs: true,
        attachments: true,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to update report:', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}

// DELETE /api/weekly-reports/[id] - Delete a weekly report
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the report
    const existingReport = await prisma.weeklyReport.findUnique({
      where: { id },
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check ownership
    if (existingReport.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only draft reports can be deleted
    if (existingReport.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot delete submitted or reviewed reports' },
        { status: 400 }
      )
    }

    // Delete associated logs first
    await prisma.dailyLog.updateMany({
      where: { weeklyReportId: id },
      data: { weeklyReportId: null },
    })

    await prisma.weeklyReport.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}
