import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Ambil satu log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const log = await prisma.logActivity.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })

  if (!log) {
    return NextResponse.json({ error: 'Log tidak ditemukan' }, { status: 404 })
  }

  // User hanya bisa lihat log sendiri, Admin bisa lihat semua
  if (session.role !== 'ADMIN' && log.userId !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(log)
}

// PUT - Update log
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existingLog = await prisma.logActivity.findUnique({
    where: { id },
  })

  if (!existingLog) {
    return NextResponse.json({ error: 'Log tidak ditemukan' }, { status: 404 })
  }

  // User hanya bisa edit log sendiri yang belum REVIEWED
  if (session.role !== 'ADMIN') {
    if (existingLog.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (existingLog.status === 'REVIEWED') {
      return NextResponse.json(
        { error: 'Log yang sudah di-review tidak bisa diedit' },
        { status: 400 }
      )
    }
  }

  try {
    const body = await request.json()
    const { title, description, date, duration, mood, status } = body

    const updateData: Record<string, unknown> = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (date) updateData.date = new Date(date)
    if (duration) updateData.duration = parseInt(duration)
    if (mood !== undefined) updateData.mood = mood
    if (status && session.role === 'ADMIN') updateData.status = status

    const log = await prisma.logActivity.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Update log error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate log' },
      { status: 500 }
    )
  }
}

// DELETE - Hapus log
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const existingLog = await prisma.logActivity.findUnique({
    where: { id },
  })

  if (!existingLog) {
    return NextResponse.json({ error: 'Log tidak ditemukan' }, { status: 404 })
  }

  // User hanya bisa hapus log sendiri yang belum REVIEWED
  if (session.role !== 'ADMIN') {
    if (existingLog.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (existingLog.status === 'REVIEWED') {
      return NextResponse.json(
        { error: 'Log yang sudah di-review tidak bisa dihapus' },
        { status: 400 }
      )
    }
  }

  await prisma.logActivity.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
