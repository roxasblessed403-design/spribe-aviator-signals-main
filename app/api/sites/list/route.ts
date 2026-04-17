import { NextResponse } from 'next/server'
import { getEnabledSitesFromStore } from '@/lib/siteStore'

// Public endpoint — no auth required (used by login page dropdown)
export async function GET() {
  const sites = getEnabledSitesFromStore()
  return NextResponse.json({ sites })
}
