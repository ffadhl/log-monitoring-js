import { NextRequest, NextResponse } from 'next/server'
import { getSession, isManager } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/career-goals/[id]/comment - Add manager comment to a career goal
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers can add comments
    if (!isManager(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { comment } = body

    if (!comment?.trim()) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    // Find the goal
    const existingGoal = await prisma.careerGoal.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Check if this manager can comment on this goal
    if (existingGoal.user.managerId !== session.id) {
      return NextResponse.json(
        { error: 'You can only comment on goals from your subordinates' },
        { status: 403 }
      )
    }

    const goal = await prisma.careerGoal.update({
      where: { id },
      data: {
        managerComment: comment.trim(),
      },
    })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Failed to add comment:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
