import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { unlink } from 'fs/promises'
import path from 'path'

// DELETE - Delete attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const { id, attachmentId } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const attachment = await prisma.weeklyLogAttachment.findUnique({
      where: { id: attachmentId },
      include: {
        weeklyLog: true,
      },
    })

    if (!attachment) {
      return NextResponse.json({ error: 'Attachment tidak ditemukan' }, { status: 404 })
    }

    if (attachment.weeklyLogId !== id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (attachment.weeklyLog.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (attachment.weeklyLog.status === 'REVIEWED' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Attachment dari log yang sudah direview tidak dapat dihapus' },
        { status: 400 }
      )
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', attachment.fileUrl)
    try {
      await unlink(filePath)
    } catch {
      // File might not exist, continue with database deletion
      console.warn('File not found:', filePath)
    }

    // Delete from database
    await prisma.weeklyLogAttachment.delete({
      where: { id: attachmentId },
    })

    return NextResponse.json({ message: 'Attachment berhasil dihapus' })
  } catch (error) {
    console.error('Delete attachment error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus attachment' },
      { status: 500 }
    )
  }
}
