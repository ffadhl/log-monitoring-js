import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const pathname = request.nextUrl.pathname

  // Public routes - accessible without authentication
  const publicRoutes = ['/auth/login']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If accessing public route with valid token, redirect to dashboard
  if (isPublicRoute) {
    if (token) {
      const user = await verifyToken(token)
      if (user) {
        return NextResponse.redirect(new URL('/app/dashboard', request.url))
      }
    }
    return NextResponse.next()
  }

  // Root path - redirect based on auth status
  if (pathname === '/') {
    if (token) {
      const user = await verifyToken(token)
      if (user) {
        return NextResponse.redirect(new URL('/app/dashboard', request.url))
      }
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Protected routes - require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Manager-only routes
  const managerRoutes = ['/app/team-review']
  const isManagerRoute = managerRoutes.some((route) => pathname.startsWith(route))
  
  if (isManagerRoute && user.role === 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  // Admin-only routes
  const adminRoutes = ['/app/admin']
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  
  if (isAdminRoute && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/app/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
}
