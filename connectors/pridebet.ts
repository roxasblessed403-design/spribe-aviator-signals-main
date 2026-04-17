import { BaseConnector } from './base'
import type { ConnectorResult } from '@/lib/types'

export class PrideBetConnector extends BaseConnector {
  id = 'pridebet'
  siteUrl = 'https://pridebet.co.zw/'
  siteName = 'PrideBet'

  async getLiveRounds(count: number): Promise<ConnectorResult> {
    // TODO: Implement live websocket/API connection to PrideBet
    // The Aviator game on this site likely uses a third-party provider (Spribe)
    // You would need to inspect the site's network traffic to find the API endpoint
    return {
      rounds: [],
      status: 'error',
      message: 'Live connector for PrideBet not yet implemented.',
    }
  }
}
