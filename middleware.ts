import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin routes protection
  if (pathname.startsWith('/admin/dashboard') ||
      pathname.startsWith('/admin/users') ||
      pathname.startsWith('/admin/sites') ||
      pathname.startsWith('/admin/signals') ||
      pathname.startsWith('/admin/settings') ||
      pathname.startsWith('/admin/logs')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) return NextResponse.redirect(new URL('/admin', req.url))
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // Client signals route protection
  if (pathname.startsWith('/signals')) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/signals/:path*', '/admin/dashboard/:path*', '/admin/users/:path*', '/admin/sites/:path*', '/admin/signals/:path*', '/admin/settings/:path*', '/admin/logs/:path*'],
}
