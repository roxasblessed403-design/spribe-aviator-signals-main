import type { Round, Signal } from '@/lib/types'
import { DEFAULT_SIGNAL_RULE } from '@/config/signals'

// =============================================
// SIGNAL ENGINE — modular and editable
// Analyzes recent rounds and outputs a signal
// =============================================

interface SignalEngineResult {
  signal: Signal
  analysis: {
    avgMultiplier: number
    lowCount: number
    midCount: number
    highCount: number
    lowStreak: number
    highStreak: number
    recentTrend: 'rising' | 'falling' | 'neutral'
  }
}

function computeStreak(rounds: Round[], isLow: boolean, threshold: number): number {
  let streak = 0
  for (const r of rounds) {
    if (isLow ? r.multiplier < threshold : r.multiplier >= threshold) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function computeTrend(rounds: Round[]): 'rising' | 'falling' | 'neutral' {
  if (rounds.length < 4) return 'neutral'
  const half = Math.floor(rounds.length / 2)
  const recent = rounds.slice(0, half).reduce((s, r) => s + r.multiplier, 0) / half
  const older = rounds.slice(half).reduce((s, r) => s + r.multiplier, 0) / half
  if (recent > older * 1.15) return 'rising'
  if (recent < older * 0.85) return 'falling'
  return 'neutral'
}

function computeSafeOdd(rounds: Round[]): number {
  if (!rounds.length) return 1.5
  const last5 = rounds.slice(0, 5)
  const avg = last5.reduce((s, r) => s + r.multiplier, 0) / last5.length
  // Safe odd is slightly below average, minimum 1.20
  return Math.max(1.20, parseFloat((avg * 0.75).toFixed(2)))
}

function computeRiskTarget(rounds: Round[]): string {
  if (!rounds.length) return '10x+'
  const maxRecent = Math.max(...rounds.slice(0, 10).map((r) => r.multiplier))
  const target = Math.max(5, Math.round(maxRecent * 1.2))
  return `${target}x+`
}

function computeTMinus(): string {
  const now = new Date()
  const nextMin = new Date(now)
  nextMin.setSeconds(0)
  nextMin.setMinutes(nextMin.getMinutes() + 1)
  const diff = Math.floor((nextMin.getTime() - now.getTime()) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function analyzeRounds(
  rounds: Round[],
  siteUrl: string
): SignalEngineResult {
  const rule = DEFAULT_SIGNAL_RULE
  const recent = rounds.slice(0, rule.streakLowCount + rule.streakHighCount + 5)

  if (recent.length === 0) {
    const fallback: Signal = {
      id: `sig-nodata`,
      label: 'No Data',
      level: 'watch',
      confidence: 0,
      safeRange: rule.safeRange,
      riskLevel: 'Moderate',
      signalStrength: 'Low',
      notes: 'Insufficient round data to generate signal.',
      siteUrl,
      timestamp: Date.now(),
      safeOdd: 1.5,
      riskTarget: '10x+',
      tMinus: computeTMinus(),
    }
    return {
      signal: fallback,
      analysis: {
        avgMultiplier: 0,
        lowCount: 0,
        midCount: 0,
        highCount: 0,
        lowStreak: 0,
        highStreak: 0,
        recentTrend: 'neutral',
      },
    }
  }

  const avgMultiplier =
    recent.reduce((s, r) => s + r.multiplier, 0) / recent.length

  const lowCount = recent.filter((r) => r.multiplier < rule.lowThreshold).length
  const midCount = recent.filter(
    (r) => r.multiplier >= rule.lowThreshold && r.multiplier < rule.midThreshold
  ).length
  const highCount = recent.filter((r) => r.multiplier >= rule.midThreshold).length

  const lowStreak = computeStreak(recent, true, rule.lowThreshold)
  const highStreak = computeStreak(recent, false, rule.midThreshold)
  const recentTrend = computeTrend(recent)

  // Determine level
  let level: Signal['level'] = 'watch'
  let riskLevel: Signal['riskLevel'] = 'Moderate'
  let signalStrength: Signal['signalStrength'] = 'Medium'
  let confidence = 50
  let label = 'Watch Zone'
  let safeRange = rule.watchRange
  let notes = ''

  if (lowStreak >= rule.streakLowCount) {
    // Many low rounds in a row — safe window may be opening
    level = 'safe'
    riskLevel = 'Low'
    signalStrength = 'High'
    confidence = Math.min(92, 60 + lowStreak * 6)
    label = 'Safe Range'
    safeRange = rule.safeRange
    notes = `${lowStreak} consecutive low rounds detected. Statistical safe window active.`
  } else if (highStreak >= rule.streakHighCount) {
    // Multiple high rounds — higher risk zone
    level = 'highrisk'
    riskLevel = 'High'
    signalStrength = 'High'
    confidence = Math.min(88, 50 + highStreak * 10)
    label = 'High Risk'
    safeRange = rule.highRiskRange
    notes = `${highStreak} high multiplier rounds detected. Elevated risk zone.`
  } else if (avgMultiplier < rule.lowThreshold + 0.3 && recentTrend !== 'rising') {
    level = 'safe'
    riskLevel = 'Low'
    signalStrength = 'Medium'
    confidence = 65
    label = 'Safe Range'
    safeRange = rule.safeRange
    notes = 'Average multiplier is low. Mild safe signal.'
  } else if (avgMultiplier > rule.midThreshold + 0.5) {
    level = 'highrisk'
    riskLevel = 'High'
    signalStrength = 'Medium'
    confidence = 62
    label = 'High Risk'
    safeRange = rule.highRiskRange
    notes = 'Recent rounds averaging above 2.5x. Exercise caution.'
  } else {
    notes = `Balanced pattern detected. Avg: ${avgMultiplier.toFixed(2)}x.`
  }

  const signal: Signal = {
    id: `sig-${Date.now()}`,
    label,
    level,
    confidence,
    safeRange,
    riskLevel,
    signalStrength,
    notes,
    siteUrl,
    timestamp: Date.now(),
    safeOdd: computeSafeOdd(recent),
    riskTarget: computeRiskTarget(recent),
    tMinus: computeTMinus(),
  }

  return {
    signal,
    analysis: {
      avgMultiplier,
      lowCount,
      midCount,
      highCount,
      lowStreak,
      highStreak,
      recentTrend,
    },
  }
}
