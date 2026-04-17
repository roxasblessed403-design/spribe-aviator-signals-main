import { NextResponse } from 'next/server'
import { validateAdminPassword, signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (!password) {
      return NextResponse.json({ error: 'Password required.' }, { status: 400 })
    }
    if (!validateAdminPassword(password)) {
      return NextResponse.json({ error: 'Invalid admin password.' }, { status: 401 })
    }

    const token = await signToken({ role: 'admin' }, '12h')

    const response = NextResponse.json({ ok: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
