import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateMockRounds } from '@/data/mockRounds'
import { summarizeRounds, isOpenAIAvailable } from '@/lib/openai'
import { getSiteByUrl } from '@/config/sites'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value || req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { siteUrl } = await req.json()
  const url = (siteUrl as string) || (payload.siteUrl as string) || 'https://winbucks.co.zw/'
  const site = getSiteByUrl(url)

  if (!isOpenAIAvailable()) {
    return NextResponse.json({ summary: 'AI features require OPENAI_API_KEY in .env.local.', aiEnabled: false })
  }

  const rounds = generateMockRounds(url, 20)
  const summary = await summarizeRounds(rounds, site?.name || url)

  return NextResponse.json({ summary, aiEnabled: true })
}
