import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const pathname = request.nextUrl.pathname

  const publicRoutes = ['/login', '/']
  if (publicRoutes.includes(pathname)) {
    if (token) {
      const user = await verifyToken(token)
      if (user) {
        const redirectUrl = user.role === 'ADMIN' ? '/admin' : '/dashboard'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/dashboard') && user.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
