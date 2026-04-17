import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { BETTING_SITES } from '@/config/sites'

// In-memory connector state (resets on restart)
// For persistence: use a DB or JSON file
let connectorState: Record<string, { mode: 'mock' | 'live'; enabled: boolean }> = {}

function getConnectors() {
  return BETTING_SITES.map(site => {
    const state = connectorState[site.id] || { mode: site.mode, enabled: site.enabled }
    return {
      id: site.id,
      siteUrl: site.url,
      siteName: site.name,
      status: state.enabled ? (state.mode === 'mock' ? 'mock' : 'online') : 'offline',
      mode: state.mode,
      enabled: state.enabled,
      lastSync: state.mode === 'mock' ? Date.now() : null,
    }
  })
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({ connectors: getConnectors() })
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, mode, enabled } = await req.json()
  const site = BETTING_SITES.find(s => s.id === id)
  if (!site) return NextResponse.json({ error: 'Connector not found' }, { status: 404 })

  const current = connectorState[id] || { mode: site.mode, enabled: site.enabled }
  connectorState[id] = {
    mode: mode ?? current.mode,
    enabled: enabled ?? current.enabled,
  }

  return NextResponse.json({ ok: true, connector: getConnectors().find(c => c.id === id) })
}
