import type { Round } from '@/lib/types'

// Realistic Aviator multiplier distribution
// Most rounds are low (1x-2x), occasionally high
function randomMultiplier(): number {
  const r = Math.random()
  if (r < 0.45) return parseFloat((1.0 + Math.random() * 0.5).toFixed(2))  // 1.00-1.50 (45%)
  if (r < 0.70) return parseFloat((1.5 + Math.random() * 0.5).toFixed(2))  // 1.50-2.00 (25%)
  if (r < 0.85) return parseFloat((2.0 + Math.random() * 3.0).toFixed(2))  // 2.00-5.00 (15%)
  if (r < 0.93) return parseFloat((5.0 + Math.random() * 5.0).toFixed(2))  // 5.00-10.0 (8%)
  if (r < 0.98) return parseFloat((10.0 + Math.random() * 20.0).toFixed(2)) // 10-30x (5%)
  return parseFloat((30 + Math.random() * 70).toFixed(2))                   // 30-100x (2%)
}

export function generateMockRounds(
  siteUrl: string,
  count: number = 30
): Round[] {
  const now = Date.now()
  const rounds: Round[] = []

  for (let i = 0; i < count; i++) {
    rounds.push({
      id: `mock-${siteUrl.replace(/\W/g, '')}-${now - i * 25000}-${i}`,
      multiplier: randomMultiplier(),
      timestamp: now - i * 25000, // ~25 sec per round
      siteUrl,
      sourceMode: 'mock',
    })
  }

  return rounds
}

// Seeded mock for consistent display
export function getStaticMockRounds(siteUrl: string): Round[] {
  const seed = [
    1.24, 3.45, 1.02, 1.78, 2.15, 1.33, 8.92, 1.05, 1.67, 2.44,
    1.11, 1.55, 4.20, 1.08, 1.99, 15.3, 1.22, 1.44, 2.87, 1.03,
    1.31, 6.66, 1.17, 1.88, 2.02, 1.44, 1.09, 3.14, 1.55, 1.21,
  ]
  const now = Date.now()
  return seed.map((multiplier, i) => ({
    id: `static-${i}`,
    multiplier,
    timestamp: now - i * 25000,
    siteUrl,
    sourceMode: 'mock' as const,
  }))
}
