import { NextRequest, NextResponse } from 'next/server'
import { getSession, isManager } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/weekly-reports/[id]/review - Review a weekly report (manager only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can review reports
    if (!isManager(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { feedback } = body

    if (!feedback?.trim()) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 })
    }

    // Find the report
    const existingReport = await prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check if this manager can review this report
    if (existingReport.user.managerId !== session.id) {
      return NextResponse.json(
        { error: 'You can only review reports from your subordinates' },
        { status: 403 }
      )
    }

    // Check if report is submitted
    if (existingReport.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Can only review submitted reports' },
        { status: 400 }
      )
    }

    const report = await prisma.weeklyReport.update({
      where: { id },
      data: {
        status: 'REVIEWED',
        managerFeedback: feedback.trim(),
      },
      include: {
        dailyLogs: true,
        attachments: true,
        user: true,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to review report:', error)
    return NextResponse.json({ error: 'Failed to review report' }, { status: 500 })
  }
}
