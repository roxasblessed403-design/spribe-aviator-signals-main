import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import {
  getAllSites,
  addCustomSite,
  updateSite,
  deleteSite,
} from '@/lib/siteStore'

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

// GET /api/admin/sites — list all sites
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sites = getAllSites()
  return NextResponse.json({ sites })
}

// POST /api/admin/sites — add new site
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, url, enabled = true, mode = 'mock' } = body

  if (!name || typeof name !== 'string' || name.trim().length < 2)
    return NextResponse.json({ error: 'Site name must be at least 2 characters.' }, { status: 400 })

  if (!url || typeof url !== 'string')
    return NextResponse.json({ error: 'URL is required.' }, { status: 400 })

  // Normalize URL
  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl
  }
  if (!normalizedUrl.endsWith('/')) normalizedUrl += '/'

  // Check for duplicate URL
  const existing = getAllSites().find(s => s.url === normalizedUrl)
  if (existing)
    return NextResponse.json({ error: `A site with this URL already exists: ${existing.name}` }, { status: 409 })

  try {
    new URL(normalizedUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 })
  }

  const newSite = addCustomSite({ name: name.trim(), url: normalizedUrl, enabled, mode })
  return NextResponse.json({ ok: true, site: newSite }, { status: 201 })
}

// PATCH /api/admin/sites — update site (enable/disable, rename, mode)
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...patch } = body

  if (!id) return NextResponse.json({ error: 'Site ID required.' }, { status: 400 })

  const updated = updateSite(id, patch)
  if (!updated) return NextResponse.json({ error: 'Site not found.' }, { status: 404 })

  return NextResponse.json({ ok: true, site: updated })
}

// DELETE /api/admin/sites — remove custom site
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req)))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Site ID required.' }, { status: 400 })

  // Prevent deleting built-in sites
  const builtInIds = ['pridebet', 'winbucks', 'bettingcozw', 'bolabet']
  if (builtInIds.includes(id))
    return NextResponse.json({ error: 'Built-in sites cannot be deleted. Disable them instead.' }, { status: 403 })

  const deleted = deleteSite(id)
  if (!deleted) return NextResponse.json({ error: 'Site not found or already removed.' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
