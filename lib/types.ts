// =============================================
// LISCONVASTAG AVIATOR SIGNALS - CORE TYPES
// =============================================

export interface Round {
  id: string
  multiplier: number
  timestamp: number
  siteUrl: string
  sourceMode: 'mock' | 'live'
}

export interface Signal {
  id: string
  label: string
  level: 'safe' | 'watch' | 'highrisk'
  confidence: number
  safeRange: string
  riskLevel: 'Low' | 'Moderate' | 'High'
  signalStrength: 'Low' | 'Medium' | 'High'
  notes: string
  siteUrl: string
  timestamp: number
  safeOdd: number
  riskTarget: string
  tMinus: string
}

export interface Connector {
  id: string
  siteUrl: string
  siteName: string
  status: 'online' | 'offline' | 'error' | 'mock'
  mode: 'mock' | 'live'
  lastSync: number | null
  enabled: boolean
}

export interface UserAccess {
  id: string
  siteUrl: string | 'all'
  passwordKey: string
  role: 'client'
  label: string
  createdAt: number
  active: boolean
}

export interface AdminUser {
  id: string
  username: string
  passwordHash: string
  role: 'admin'
}

export interface SignalRule {
  id: string
  name: string
  lowThreshold: number
  midThreshold: number
  highThreshold: number
  streakLowCount: number
  streakHighCount: number
  safeRange: string
  watchRange: string
  highRiskRange: string
}

export interface SiteConfig {
  id: string
  name: string
  url: string
  enabled: boolean
  mode: 'mock' | 'live'
  order: number
}

export interface AppLog {
  id: string
  level: 'info' | 'warn' | 'error'
  message: string
  source: string
  timestamp: number
  data?: Record<string, unknown>
}

export interface ConnectorResult {
  rounds: Round[]
  status: 'ok' | 'error'
  message?: string
}
