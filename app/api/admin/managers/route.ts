// app/api/admin/managers/route.ts
// Get list of users who can be managers (ADMIN or MANAGER role)
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const currentUser = await getSession()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const managers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            subordinates: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(managers)
  } catch (error) {
    console.error('Failed to fetch managers:', error)
    return NextResponse.json({ error: 'Failed to fetch managers' }, { status: 500 })
  }
}
