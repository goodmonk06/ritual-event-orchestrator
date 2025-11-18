/**
 * Stub client for community-currency-economy-core service
 * Awards currency for ritual participation
 */

export interface RewardPayload {
  memberId: string
  amount: number
  reason: string
  metadata: Record<string, unknown>
}

export class CurrencyEconomyClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.CURRENCY_ECONOMY_URL || 'http://localhost:3002'
  }

  async awardCurrency(payload: RewardPayload): Promise<void> {
    console.log('[CurrencyEconomy] Awarding currency:', {
      url: `${this.baseUrl}/api/rewards`,
      memberId: payload.memberId,
      amount: payload.amount,
      reason: payload.reason,
    })

    // Stub implementation
    try {
      // await fetch(`${this.baseUrl}/api/rewards`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // })
      console.log('[CurrencyEconomy] ✓ Currency awarded (stub)')
    } catch (error) {
      console.error('[CurrencyEconomy] Failed to award currency:', error)
      throw error
    }
  }

  async awardParticipationRewards(
    ritualInstanceId: string,
    participantIds: string[],
    ritualName: string,
    baseReward: number = 10
  ): Promise<void> {
    console.log('[CurrencyEconomy] Awarding participation rewards to', participantIds.length, 'participants')

    for (const memberId of participantIds) {
      await this.awardCurrency({
        memberId,
        amount: baseReward,
        reason: `Participated in ${ritualName}`,
        metadata: {
          ritualInstanceId,
          type: 'ritual_participation',
        },
      })
    }
  }
}

export const currencyEconomy = new CurrencyEconomyClient()
