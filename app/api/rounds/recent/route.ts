import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateMockRounds } from '@/data/mockRounds'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value || req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteUrl = (payload.siteUrl as string) || 'https://winbucks.co.zw/'
  const url = new URL(req.url)
  const count = Math.min(parseInt(url.searchParams.get('count') || '30'), 100)

  const rounds = generateMockRounds(siteUrl, count)

  return NextResponse.json({ rounds, count: rounds.length, siteUrl })
}
