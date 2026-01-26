import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/weekly-reports/[id]/submit - Submit a weekly report for review
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the report
    const existingReport = await prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        dailyLogs: true,
      },
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Check ownership
    if (existingReport.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if report is in draft status
    if (existingReport.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Report has already been submitted' },
        { status: 400 }
      )
    }

    // Check if there are any daily logs
    if (existingReport.dailyLogs.length === 0) {
      return NextResponse.json(
        { error: 'Cannot submit report without any daily logs' },
        { status: 400 }
      )
    }

    const report = await prisma.weeklyReport.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
      },
      include: {
        dailyLogs: true,
        attachments: true,
      },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Failed to submit report:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
