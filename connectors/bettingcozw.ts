import { BaseConnector } from './base'
import type { ConnectorResult } from '@/lib/types'

export class BettingCoZwConnector extends BaseConnector {
  id = 'bettingcozw'
  siteUrl = 'https://betting.co.zw/'
  siteName = 'Betting.co.zw'

  async getLiveRounds(_count: number): Promise<ConnectorResult> {
    return {
      rounds: [],
      status: 'error',
      message: 'Live connector for Betting.co.zw not yet implemented.',
    }
  }
}
