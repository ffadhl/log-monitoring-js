import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Ambil detail weekly log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const log = await prisma.weeklyLog.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      attachments: true,
    },
  })

  if (!log) {
    return NextResponse.json({ error: 'Log tidak ditemukan' }, { status: 404 })
  }

  // Check if user has access (own log or admin)
  if (log.userId !== session.id && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(log)
}

// PUT - Update weekly log
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const log = await prisma.weeklyLog.findUnique({
      where: { id },
    })

    if (!log) {
      return NextResponse.json({ error: 'Log tidak ditemukan' }, { status: 404 })
    }

    // Admin can update status, owner can update content if not reviewed
    const isAdmin = session.role === 'ADMIN'
    const isOwner = log.userId === session.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // If admin is updating status
    if (isAdmin && body.status) {
      const updatedLog = await prisma.weeklyLog.update({
        where: { id },
        data: { status: body.status },
        include: {
          attachments: true,
        },
      })
      return NextResponse.json(updatedLog)
    }

    // Owner can't update if already reviewed
    if (isOwner && log.status === 'REVIEWED') {
      return NextResponse.json(
        { error: 'Log yang sudah direview tidak dapat diedit' },
        { status: 400 }
      )
    }

    const { title, description, summary, totalDuration, mood } = body

    const updatedLog = await prisma.weeklyLog.update({
      where: { id },
      data: {
        title,
        description,
        summary,
        totalDuration: totalDuration ? parseInt(totalDuration) : undefined,
        mood,
      },
      include: {
        attachments: true,
      },
    })

    return NextResponse.json(updatedLog)
  } catch (error) {
    console.error('Update weekly log error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate log' },
      { status: 500 }
    )
  }
}

// DELETE - Hapus weekly log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const log = await prisma.weeklyLog.findUnique({
      where: { id },
    })

    if (!log) {
      return NextResponse.json({ error: 'Log tidak ditemukan' }, { status: 404 })
    }

    if (log.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (log.status === 'REVIEWED' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Log yang sudah direview tidak dapat dihapus' },
        { status: 400 }
      )
    }

    await prisma.weeklyLog.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Log berhasil dihapus' })
  } catch (error) {
    console.error('Delete weekly log error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus log' },
      { status: 500 }
    )
  }
}
