import type { Round, ConnectorResult } from '@/lib/types'
import { generateMockRounds } from '@/data/mockRounds'

// =============================================
// BASE CONNECTOR — all site connectors extend this
// =============================================

export abstract class BaseConnector {
  abstract id: string
  abstract siteUrl: string
  abstract siteName: string

  mode: 'mock' | 'live' = 'mock'

  async getRounds(count = 30): Promise<ConnectorResult> {
    if (this.mode === 'mock') {
      return this.getMockRounds(count)
    }
    return this.getLiveRounds(count)
  }

  getMockRounds(count = 30): ConnectorResult {
    return {
      rounds: generateMockRounds(this.siteUrl, count),
      status: 'ok',
    }
  }

  // Override in subclass for live data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getLiveRounds(_count: number): Promise<ConnectorResult> {
    // TODO: Implement per-site live fetching
    // NOTE: Aviator sites don't expose public APIs.
    // Live mode requires reverse-engineering websocket connections
    // or working with site providers directly.
    return {
      rounds: [],
      status: 'error',
      message: `Live mode not yet implemented for ${this.siteName}. Using mock fallback.`,
    }
  }

  setMode(mode: 'mock' | 'live') {
    this.mode = mode
  }

  getStatus(): 'mock' | 'online' | 'offline' {
    return this.mode === 'mock' ? 'mock' : 'online'
  }
}

// Registry
const connectorRegistry = new Map<string, BaseConnector>()

export function registerConnector(connector: BaseConnector) {
  connectorRegistry.set(connector.id, connector)
}

export function getConnector(id: string): BaseConnector | undefined {
  return connectorRegistry.get(id)
}

export function getConnectorByUrl(url: string): BaseConnector | undefined {
  for (const c of connectorRegistry.values()) {
    if (c.siteUrl === url) return c
  }
  return undefined
}

export function getAllConnectors(): BaseConnector[] {
  return Array.from(connectorRegistry.values())
}

// Auto-register all connectors
export function initConnectors() {
  const { PrideBetConnector } = require('./pridebet')
  const { WinBucksConnector } = require('./winbucks')
  const { BettingCoZwConnector } = require('./bettingcozw')
  const { BolaBetConnector } = require('./bolabet')

  registerConnector(new PrideBetConnector())
  registerConnector(new WinBucksConnector())
  registerConnector(new BettingCoZwConnector())
  registerConnector(new BolaBetConnector())
}
