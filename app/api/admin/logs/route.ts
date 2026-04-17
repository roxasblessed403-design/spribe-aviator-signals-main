import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

interface AppLog {
  id: string
  level: 'info' | 'warn' | 'error'
  message: string
  source: string
  timestamp: number
}

// In-memory log store (resets on restart)
const logs: AppLog[] = [
  { id: '1', level: 'info', message: 'System initialized in MOCK mode', source: 'core', timestamp: Date.now() - 60000 * 5 },
  { id: '2', level: 'info', message: 'PrideBet connector loaded (mock)', source: 'pridebet', timestamp: Date.now() - 60000 * 4 },
  { id: '3', level: 'info', message: 'WinBucks connector loaded (mock)', source: 'winbucks', timestamp: Date.now() - 60000 * 4 },
  { id: '4', level: 'info', message: 'Betting.co.zw connector loaded (mock)', source: 'bettingcozw', timestamp: Date.now() - 60000 * 3 },
  { id: '5', level: 'info', message: 'BolaBet connector loaded (mock)', source: 'bolabet', timestamp: Date.now() - 60000 * 3 },
  { id: '6', level: 'info', message: 'Signal engine ready', source: 'signal-engine', timestamp: Date.now() - 60000 * 2 },
  { id: '7', level: process.env.OPENAI_API_KEY ? 'info' : 'warn', message: process.env.OPENAI_API_KEY ? 'OpenAI integration active' : 'OpenAI API key not set — AI features disabled', source: 'openai', timestamp: Date.now() - 60000 },
]

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ logs: logs.slice(0, 100) })
}
