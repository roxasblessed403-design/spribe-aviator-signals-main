import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateMockRounds } from '@/data/mockRounds'
import { analyzeRounds } from '@/lib/signalEngine'
import { explainSignal, isOpenAIAvailable } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value || req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { siteUrl } = await req.json()
  const url = (siteUrl as string) || (payload.siteUrl as string) || 'https://winbucks.co.zw/'

  if (!isOpenAIAvailable()) {
    return NextResponse.json({
      explanation: 'AI analysis is not configured. Add OPENAI_API_KEY to .env.local to enable this feature.',
      aiEnabled: false,
    })
  }

  const rounds = generateMockRounds(url, 20)
  const { signal } = analyzeRounds(rounds, url)
  const explanation = await explainSignal(signal, rounds)

  return NextResponse.json({ explanation, signal, aiEnabled: true })
}
