import { BaseConnector } from './base'
import type { ConnectorResult } from '@/lib/types'

export class WinBucksConnector extends BaseConnector {
  id = 'winbucks'
  siteUrl = 'https://winbucks.co.zw/'
  siteName = 'WinBucks'

  async getLiveRounds(_count: number): Promise<ConnectorResult> {
    // TODO: Implement live connection to WinBucks Aviator
    return {
      rounds: [],
      status: 'error',
      message: 'Live connector for WinBucks not yet implemented.',
    }
  }
}
