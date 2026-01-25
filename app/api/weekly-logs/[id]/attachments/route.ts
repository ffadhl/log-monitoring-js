import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST - Upload attachment to weekly log
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if weekly log exists and user has access
    const weeklyLog = await prisma.weeklyLog.findUnique({
      where: { id },
    })

    if (!weeklyLog) {
      return NextResponse.json({ error: 'Weekly log tidak ditemukan' }, { status: 404 })
    }

    if (weeklyLog.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (weeklyLog.status === 'REVIEWED' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Log yang sudah direview tidak dapat ditambahkan attachment' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File harus diupload' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 10MB' },
        { status: 400 }
      )
    }

    // Determine file type
    const mimeType = file.type
    let fileType = 'other'
    if (mimeType.startsWith('image/')) {
      fileType = 'image'
    } else if (
      mimeType.includes('pdf') ||
      mimeType.includes('document') ||
      mimeType.includes('spreadsheet') ||
      mimeType.includes('presentation') ||
      mimeType.includes('text/')
    ) {
      fileType = 'document'
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'weekly-logs', id)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const baseName = path.basename(file.name, extension)
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_')
    const fileName = `${safeBaseName}_${timestamp}${extension}`
    const filePath = path.join(uploadDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create attachment record
    const fileUrl = `/uploads/weekly-logs/${id}/${fileName}`
    const attachment = await prisma.weeklyLogAttachment.create({
      data: {
        fileName: file.name,
        fileUrl,
        fileType,
        fileSize: file.size,
        weeklyLogId: id,
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Upload attachment error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupload file' },
      { status: 500 }
    )
  }
}

// GET - Get all attachments for a weekly log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const weeklyLog = await prisma.weeklyLog.findUnique({
      where: { id },
      include: {
        attachments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!weeklyLog) {
      return NextResponse.json({ error: 'Weekly log tidak ditemukan' }, { status: 404 })
    }

    if (weeklyLog.userId !== session.id && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(weeklyLog.attachments)
  } catch (error) {
    console.error('Get attachments error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data attachments' },
      { status: 500 }
    )
  }
}
