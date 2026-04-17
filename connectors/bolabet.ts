import { BaseConnector } from './base'
import type { ConnectorResult } from '@/lib/types'

export class BolaBetConnector extends BaseConnector {
  id = 'bolabet'
  siteUrl = 'https://www.bolabet.co.zw/'
  siteName = 'BolaBet'

  async getLiveRounds(_count: number): Promise<ConnectorResult> {
    return {
      rounds: [],
      status: 'error',
      message: 'Live connector for BolaBet not yet implemented.',
    }
  }
}
