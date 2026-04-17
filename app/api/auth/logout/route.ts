import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('auth_token')
  response.cookies.delete('admin_token')
  return response
}
