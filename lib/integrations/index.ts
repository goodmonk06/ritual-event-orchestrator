/**
 * Integration orchestrator
 * Coordinates calls to external services when ritual events occur
 */

import { notificationHub } from './notification-hub'
import { currencyEconomy } from './currency-economy'
import { questEngine } from './quest-engine'

export interface RitualCompletionPayload {
  ritualInstanceId: string
  ritualTemplateKey: string
  ritualName: string
  attendedParticipantIds: string[]
}

export async function handleRitualCompletion(payload: RitualCompletionPayload): Promise<void> {
  console.log('[Integrations] Handling ritual completion for:', payload.ritualName)

  const { ritualInstanceId, ritualTemplateKey, ritualName, attendedParticipantIds } = payload

  if (attendedParticipantIds.length === 0) {
    console.log('[Integrations] No attendees, skipping integration calls')
    return
  }

  try {
    // Run integrations in parallel
    await Promise.allSettled([
      // Send follow-up notifications
      notificationHub.sendRitualCompletionNotification(
        ritualInstanceId,
        attendedParticipantIds,
        ritualName
      ),

      // Award participation rewards
      currencyEconomy.awardParticipationRewards(
        ritualInstanceId,
        attendedParticipantIds,
        ritualName
      ),

      // Mark quest steps complete
      questEngine.markRitualQuestSteps(
        ritualTemplateKey,
        attendedParticipantIds,
        ritualInstanceId
      ),
    ])

    console.log('[Integrations] ✓ All integration calls completed')
  } catch (error) {
    console.error('[Integrations] Error in integration calls:', error)
    // Don't throw - integrations are non-critical
  }
}

export { notificationHub, currencyEconomy, questEngine }
