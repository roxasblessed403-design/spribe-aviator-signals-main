import { NextResponse } from 'next/server'
import { validateClientKey, signToken } from '@/lib/auth'
import { getEnabledSitesFromStore } from '@/lib/siteStore'

export async function POST(req: Request) {
  try {
    const { siteUrl, accessKey } = await req.json()
    if (!siteUrl)   return NextResponse.json({ error: 'Please select a betting site.' }, { status: 400 })
    if (!accessKey) return NextResponse.json({ error: 'Access key is required.' }, { status: 400 })

    const enabledSites = getEnabledSitesFromStore()
    const site = enabledSites.find(s => s.url === siteUrl)
    if (!site) return NextResponse.json({ error: 'Selected site is not available.' }, { status: 400 })

    if (!validateClientKey(accessKey))
      return NextResponse.json({ error: 'Invalid access key.' }, { status: 401 })

    const token = await signToken({ role: 'client', siteUrl, siteName: site.name })
    const response = NextResponse.json({ ok: true, siteName: site.name })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
