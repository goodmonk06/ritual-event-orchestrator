/**
 * Default event handlers for common integration scenarios
 */

import { logger } from '../logger'
import { metrics } from '../metrics'
import { getNotificationAdapter, getCurrencyAdapter, getQuestAdapter } from '../adapters'
import type {
  InstanceCompletedEvent,
  InstanceStartedEvent,
  ParticipantCheckedInEvent,
  FeedbackSubmittedEvent,
} from './types'

/**
 * Send notifications when ritual is completed
 */
export async function handleRitualCompletionNotifications(event: InstanceCompletedEvent): Promise<void> {
  try {
    const adapter = getNotificationAdapter()
    await adapter.sendNotification({
      recipientIds: event.payload.attendedParticipantIds,
      templateKey: 'ritual_completion',
      data: {
        instanceId: event.payload.instanceId,
        ritualName: event.payload.ritualName,
        timestamp: event.timestamp.toISOString(),
      },
    })
    logger.info('Completion notifications sent', {
      instanceId: event.payload.instanceId,
      count: event.payload.attendedParticipantIds.length,
    })
  } catch (error) {
    logger.error('Failed to send completion notifications', error, {
      instanceId: event.payload.instanceId,
    })
  }
}

/**
 * Award currency rewards for ritual participation
 */
export async function handleRitualCompletionRewards(event: InstanceCompletedEvent): Promise<void> {
  try {
    const adapter = getCurrencyAdapter()
    const baseReward = 10

    await adapter.awardBulk(
      event.payload.attendedParticipantIds.map(memberId => ({
        memberId,
        amount: baseReward,
        reason: `Participated in ${event.payload.ritualName}`,
        metadata: {
          instanceId: event.payload.instanceId,
          templateId: event.payload.templateId,
          eventId: event.eventId,
        },
      }))
    )

    logger.info('Participation rewards awarded', {
      instanceId: event.payload.instanceId,
      count: event.payload.attendedParticipantIds.length,
      totalRewards: baseReward * event.payload.attendedParticipantIds.length,
    })
  } catch (error) {
    logger.error('Failed to award participation rewards', error, {
      instanceId: event.payload.instanceId,
    })
  }
}

/**
 * Mark quest steps complete for ritual attendance
 */
export async function handleRitualCompletionQuestProgress(event: InstanceCompletedEvent): Promise<void> {
  try {
    const adapter = getQuestAdapter()

    // Map template keys to quest steps
    const questMapping: Record<string, { questKey: string; stepKey: string }> = {
      'new-moon-intention': { questKey: 'lunar-journey', stepKey: 'attend-new-moon' },
      'inner-work-weekly': { questKey: 'inner-work-path', stepKey: 'weekly-session' },
    }

    const questInfo = questMapping[event.payload.templateKey]
    if (!questInfo) {
      logger.debug('No quest mapping for template', { templateKey: event.payload.templateKey })
      return
    }

    await adapter.markStepsBulk(
      event.payload.attendedParticipantIds.map(memberId => ({
        memberId,
        questKey: questInfo.questKey,
        stepKey: questInfo.stepKey,
        completedAt: event.timestamp,
        metadata: {
          instanceId: event.payload.instanceId,
          eventId: event.eventId,
        },
      }))
    )

    logger.info('Quest progress updated', {
      instanceId: event.payload.instanceId,
      questKey: questInfo.questKey,
      count: event.payload.attendedParticipantIds.length,
    })
  } catch (error) {
    logger.error('Failed to update quest progress', error, {
      instanceId: event.payload.instanceId,
    })
  }
}

/**
 * Track metrics for ritual events
 */
export function handleInstanceMetrics(event: InstanceStartedEvent | InstanceCompletedEvent): void {
  if (event.eventType === 'instance.started') {
    metrics.incrementCounter('ritual_instance_started', {
      templateId: event.payload.templateId,
    })
  } else if (event.eventType === 'instance.completed') {
    metrics.incrementCounter('ritual_instance_completed', {
      templateId: event.payload.templateId,
    })
    metrics.recordHistogram('ritual_participant_count', event.payload.attendedParticipantIds.length, {
      templateId: event.payload.templateId,
    })
    metrics.recordHistogram('ritual_duration_minutes', event.payload.duration, {
      templateId: event.payload.templateId,
    })
  }
}

/**
 * Log participant check-ins
 */
export function handleParticipantCheckIn(event: ParticipantCheckedInEvent): void {
  metrics.incrementCounter('participant_checkin', {
    instanceId: event.payload.instanceId,
  })
  logger.info('Participant checked in', {
    instanceId: event.payload.instanceId,
    memberId: event.payload.memberId,
  })
}

/**
 * Process feedback submissions
 */
export async function handleFeedbackSubmission(event: FeedbackSubmittedEvent): Promise<void> {
  const { ratings } = event.payload

  // Track feedback metrics
  if (ratings.content) {
    metrics.recordHistogram('feedback_content_rating', ratings.content)
  }
  if (ratings.facilitation) {
    metrics.recordHistogram('feedback_facilitation_rating', ratings.facilitation)
  }
  if (ratings.energy) {
    metrics.recordHistogram('feedback_energy_rating', ratings.energy)
  }
  if (ratings.value) {
    metrics.recordHistogram('feedback_value_rating', ratings.value)
  }

  logger.info('Feedback submitted', {
    feedbackId: event.payload.feedbackId,
    instanceId: event.payload.instanceId,
  })
}

/**
 * Register all default event handlers
 */
export function registerDefaultEventHandlers() {
  const { eventEmitter } = require('./emitter')

  // Ritual completion handlers
  eventEmitter.on('instance.completed', handleRitualCompletionNotifications)
  eventEmitter.on('instance.completed', handleRitualCompletionRewards)
  eventEmitter.on('instance.completed', handleRitualCompletionQuestProgress)

  // Metrics handlers
  eventEmitter.on('instance.started', handleInstanceMetrics)
  eventEmitter.on('instance.completed', handleInstanceMetrics)
  eventEmitter.on('participant.checkedIn', handleParticipantCheckIn)
  eventEmitter.on('feedback.submitted', handleFeedbackSubmission)

  logger.info('Default event handlers registered')
}
