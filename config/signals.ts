import type { SignalRule } from '@/lib/types'

// =============================================
// TO EDIT SIGNAL RULES: Change values here
// =============================================

export const DEFAULT_SIGNAL_RULE: SignalRule = {
  id: 'default',
  name: 'Default Rule',
  lowThreshold: 1.5,
  midThreshold: 2.0,
  highThreshold: 5.0,
  streakLowCount: 5,
  streakHighCount: 3,
  safeRange: '1.20x – 1.50x',
  watchRange: '1.50x – 2.00x',
  highRiskRange: '2.00x+',
}

export const SIGNAL_CONFIG = {
  recentRoundsToAnalyze: 20,
  minRoundsForSignal: 5,
  confidenceDecay: 0.05,
}
