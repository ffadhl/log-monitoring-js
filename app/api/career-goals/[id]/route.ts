import { NextRequest, NextResponse } from 'next/server'
import { getSession, isManager } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/career-goals/[id] - Fetch a specific career goal
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const goal = await prisma.careerGoal.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check access - owner or their manager
    const isOwner = goal.userId === session.id
    const isGoalManager =
      isManager(session.role) && goal.user.managerId === session.id

    if (!isOwner && !isGoalManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Failed to fetch goal:', error)
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 })
  }
}

// PUT /api/career-goals/[id] - Update a career goal
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, targetDate, status } = body

    // Find the goal
    const existingGoal = await prisma.careerGoal.findUnique({
      where: { id },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check ownership
    if (existingGoal.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const goal = await prisma.careerGoal.update({
      where: { id },
      data: {
        title: title?.trim() || existingGoal.title,
        description: description?.trim() || existingGoal.description,
        targetDate: targetDate !== undefined ? (targetDate ? new Date(targetDate) : null) : existingGoal.targetDate,
        status: status || existingGoal.status,
      },
    })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Failed to update goal:', error)
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}

// DELETE /api/career-goals/[id] - Delete a career goal
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the goal
    const existingGoal = await prisma.careerGoal.findUnique({
      where: { id },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check ownership
    if (existingGoal.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.careerGoal.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
