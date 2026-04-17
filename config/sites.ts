import type { SiteConfig } from '@/lib/types'

// =============================================
// TO ADD / REMOVE BETTING SITES: Edit this array
// =============================================

export const BETTING_SITES: SiteConfig[] = [
  {
    id: 'pridebet',
    name: 'PrideBet',
    url: 'https://pridebet.co.zw/',
    enabled: true,
    mode: 'mock',
    order: 1,
  },
  {
    id: 'winbucks',
    name: 'WinBucks',
    url: 'https://winbucks.co.zw/',
    enabled: true,
    mode: 'mock',
    order: 2,
  },
  {
    id: 'bettingcozw',
    name: 'Betting.co.zw',
    url: 'https://betting.co.zw/',
    enabled: true,
    mode: 'mock',
    order: 3,
  },
  {
    id: 'bolabet',
    name: 'BolaBet',
    url: 'https://www.bolabet.co.zw/',
    enabled: true,
    mode: 'mock',
    order: 4,
  },
]

export function getSiteByUrl(url: string): SiteConfig | undefined {
  return BETTING_SITES.find((s) => s.url === url)
}

export function getSiteById(id: string): SiteConfig | undefined {
  return BETTING_SITES.find((s) => s.id === id)
}

export function getEnabledSites(): SiteConfig[] {
  return BETTING_SITES.filter((s) => s.enabled).sort((a, b) => a.order - b.order)
}
