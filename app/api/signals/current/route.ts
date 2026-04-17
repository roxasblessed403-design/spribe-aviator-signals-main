import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateMockRounds } from '@/data/mockRounds'
import { analyzeRounds } from '@/lib/signalEngine'
import { getSiteByUrl } from '@/config/sites'
import { isOpenAIAvailable } from '@/lib/openai'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value || req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const siteUrl = (payload.siteUrl as string) || 'https://winbucks.co.zw/'
  const site = getSiteByUrl(siteUrl)
  const siteName = site?.name || (payload.siteName as string) || 'Unknown'

  const rounds = generateMockRounds(siteUrl, 30)
  const { signal } = analyzeRounds(rounds, siteUrl)

  return NextResponse.json({
    signal,
    siteUrl,
    siteName,
    aiEnabled: isOpenAIAvailable(),
  })
}
