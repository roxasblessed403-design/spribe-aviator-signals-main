import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { analyzeRounds } from '@/lib/signalEngine'
import { explainSignal, summarizeRounds, isOpenAIAvailable } from '@/lib/openai'
import type { Round } from '@/lib/types'

export async function POST(req: NextRequest) {
  // Auth — client or admin token accepted
  const token =
    req.cookies.get('auth_token')?.value ||
    req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { rawInput, siteUrl, siteName } = body

  if (!rawInput || typeof rawInput !== 'string') {
    return NextResponse.json({ error: 'rawInput is required.' }, { status: 400 })
  }

  // ── Parse rounds from raw text ──────────────────────
  // Accepts: comma / space / newline separated numbers
  // e.g. "1.24, 3.45, 1.02\n1.78 2.15"
  // Also handles copy-paste formats like "1.24x 3.45x"
  const cleaned = rawInput
    .replace(/x/gi, '')     // remove trailing x (e.g. 1.24x)
    .replace(/[,;\|\t\n\r]+/g, ' ')  // normalize separators
    .trim()

  const parts = cleaned.split(/\s+/).filter(Boolean)

  const multipliers: number[] = []
  const rejected: string[] = []

  for (const p of parts) {
    const n = parseFloat(p)
    if (isNaN(n) || n < 1.0 || n > 1000) {
      if (p.length > 0) rejected.push(p)
    } else {
      multipliers.push(n)
    }
  }

  if (multipliers.length < 2) {
    return NextResponse.json({
      error: `Not enough valid rounds. Found ${multipliers.length} — need at least 2. Check your input format.`,
      rejected,
    }, { status: 422 })
  }

  // Build Round objects
  const now = Date.now()
  const rounds: Round[] = multipliers.map((m, i) => ({
    id: `manual-${now}-${i}`,
    multiplier: m,
    timestamp: now - i * 25000,
    siteUrl: siteUrl || 'manual',
    sourceMode: 'mock' as const,
  }))

  // Run signal engine
  const { signal, analysis } = analyzeRounds(rounds, siteUrl || 'manual')

  // AI explanation (if available)
  let aiExplanation = ''
  let aiSummary = ''

  if (isOpenAIAvailable()) {
    try {
      const [exp, sum] = await Promise.all([
        explainSignal(signal, rounds),
        summarizeRounds(rounds, siteName || siteUrl || 'Manual Input'),
      ])
      aiExplanation = exp
      aiSummary     = sum
    } catch {
      aiExplanation = 'AI explanation unavailable.'
      aiSummary     = ''
    }
  }

  return NextResponse.json({
    ok: true,
    parsedCount:   multipliers.length,
    rejected,
    rounds,
    signal,
    analysis,
    aiExplanation,
    aiSummary,
    aiEnabled: isOpenAIAvailable(),
  })
}
