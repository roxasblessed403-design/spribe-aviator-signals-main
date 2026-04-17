/**
 * SITE STORE
 * -------------------------------------------------
 * Stores custom (admin-added) sites in a JSON file
 * at data/custom-sites.json so they survive server
 * restarts locally.
 *
 * ⚠ VERCEL NOTE:
 * Vercel's filesystem is read-only in production.
 * Custom sites added in the dashboard will persist
 * for the lifetime of that serverless function instance
 * but will reset on new deployments.
 *
 * TO MAKE SITES FULLY PERSISTENT ON VERCEL:
 * Replace the file read/write below with a database
 * call (e.g. Vercel KV, PlanetScale, Supabase).
 * The interface stays exactly the same — just swap
 * readStore / writeStore implementations.
 */

import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import type { SiteConfig } from '@/lib/types'
import { BETTING_SITES } from '@/config/sites'

const DATA_DIR  = join(process.cwd(), 'data')
const STORE_PATH = join(DATA_DIR, 'custom-sites.json')

interface SiteStore {
  customSites: SiteConfig[]
  // runtime overrides for built-in sites (mode, enabled)
  overrides: Record<string, Partial<SiteConfig>>
}

function readStore(): SiteStore {
  try {
    if (!existsSync(STORE_PATH)) return { customSites: [], overrides: {} }
    const raw = readFileSync(STORE_PATH, 'utf-8')
    return JSON.parse(raw) as SiteStore
  } catch {
    return { customSites: [], overrides: {} }
  }
}

function writeStore(store: SiteStore): void {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8')
  } catch {
    // On Vercel production — write silently fails (read-only fs)
    // Sites added in that session are still served from memory
  }
}

// In-memory fallback for Vercel's read-only filesystem
let memoryStore: SiteStore = { customSites: [], overrides: {} }

function getStore(): SiteStore {
  const fromFile = readStore()
  // Merge file store with memory store (memory wins for new additions)
  return {
    customSites: [
      ...fromFile.customSites,
      ...memoryStore.customSites.filter(
        ms => !fromFile.customSites.find(fs => fs.id === ms.id)
      ),
    ],
    overrides: { ...fromFile.overrides, ...memoryStore.overrides },
  }
}

function saveStore(store: SiteStore): void {
  memoryStore = store
  writeStore(store)
}

// ── Public API ─────────────────────────────────

/** All sites: built-in + custom, with overrides applied */
export function getAllSites(): SiteConfig[] {
  const store = getStore()

  const builtIn = BETTING_SITES.map(site => ({
    ...site,
    ...(store.overrides[site.id] || {}),
  }))

  return [...builtIn, ...store.customSites].sort((a, b) => a.order - b.order)
}

/** Only enabled sites (for client dropdown) */
export function getEnabledSitesFromStore(): SiteConfig[] {
  return getAllSites().filter(s => s.enabled)
}

/** Add a brand-new custom site */
export function addCustomSite(site: Omit<SiteConfig, 'id' | 'order'>): SiteConfig {
  const store = getStore()
  const maxOrder = Math.max(0, ...getAllSites().map(s => s.order))
  const newSite: SiteConfig = {
    ...site,
    id: `custom-${Date.now()}`,
    order: maxOrder + 1,
  }
  store.customSites.push(newSite)
  saveStore(store)
  return newSite
}

/** Update a site (built-in override or custom edit) */
export function updateSite(id: string, patch: Partial<SiteConfig>): SiteConfig | null {
  const store = getStore()
  const isBuiltIn = BETTING_SITES.find(s => s.id === id)

  if (isBuiltIn) {
    store.overrides[id] = { ...(store.overrides[id] || {}), ...patch }
    saveStore(store)
    return { ...isBuiltIn, ...store.overrides[id] }
  }

  const idx = store.customSites.findIndex(s => s.id === id)
  if (idx === -1) return null
  store.customSites[idx] = { ...store.customSites[idx], ...patch }
  saveStore(store)
  return store.customSites[idx]
}

/** Delete a custom site (built-in sites cannot be deleted, only disabled) */
export function deleteSite(id: string): boolean {
  const store = getStore()
  const before = store.customSites.length
  store.customSites = store.customSites.filter(s => s.id !== id)
  saveStore(store)
  return store.customSites.length < before
}

/** Get single site by id */
export function getSiteById(id: string): SiteConfig | undefined {
  return getAllSites().find(s => s.id === id)
}

/** Get single site by URL */
export function getSiteByUrlFromStore(url: string): SiteConfig | undefined {
  return getAllSites().find(s => s.url === url)
}
