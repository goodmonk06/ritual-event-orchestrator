/**
 * Stub client for quest-based-learning-path-engine service
 * Marks quest steps as completed when rituals are finished
 */

export interface QuestStepCompletionPayload {
  memberId: string
  questKey: string
  stepKey: string
  completedAt: string
  metadata: Record<string, unknown>
}

export class QuestEngineClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.QUEST_ENGINE_URL || 'http://localhost:3003'
  }

  async markStepComplete(payload: QuestStepCompletionPayload): Promise<void> {
    console.log('[QuestEngine] Marking quest step complete:', {
      url: `${this.baseUrl}/api/quest-progress`,
      memberId: payload.memberId,
      questKey: payload.questKey,
      stepKey: payload.stepKey,
    })

    // Stub implementation
    try {
      // await fetch(`${this.baseUrl}/api/quest-progress`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // })
      console.log('[QuestEngine] ✓ Quest step marked complete (stub)')
    } catch (error) {
      console.error('[QuestEngine] Failed to mark quest step:', error)
      throw error
    }
  }

  async markRitualQuestSteps(
    ritualTemplateKey: string,
    participantIds: string[],
    ritualInstanceId: string
  ): Promise<void> {
    console.log('[QuestEngine] Marking ritual quest steps for', participantIds.length, 'participants')

    // Map ritual template keys to quest steps
    const questMapping: Record<string, { questKey: string; stepKey: string }> = {
      'new-moon-intention': { questKey: 'lunar-journey', stepKey: 'attend-new-moon' },
      'inner-work-weekly': { questKey: 'inner-work-path', stepKey: 'weekly-session' },
    }

    const questInfo = questMapping[ritualTemplateKey]
    if (!questInfo) {
      console.log('[QuestEngine] No quest mapping for ritual:', ritualTemplateKey)
      return
    }

    for (const memberId of participantIds) {
      await this.markStepComplete({
        memberId,
        questKey: questInfo.questKey,
        stepKey: questInfo.stepKey,
        completedAt: new Date().toISOString(),
        metadata: {
          ritualInstanceId,
          ritualTemplateKey,
        },
      })
    }
  }
}

export const questEngine = new QuestEngineClient()
