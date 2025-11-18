/**
 * Service layer for RitualInstance business logic
 * Centralizes complex operations and integrations
 */

import { prisma } from '../db'
import { eventEmitter } from '../events'
import { logger } from '../logger'
import { NotFoundError, ValidationError } from '../errors'
import type { InstanceStatus } from '@prisma/client'

export class RitualInstanceService {
  /**
   * Start a ritual instance
   */
  async startInstance(instanceId: string): Promise<void> {
    const instance = await prisma.ritualInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: true,
        participants: true,
      },
    })

    if (!instance) {
      throw new NotFoundError('RitualInstance', instanceId)
    }

    if (instance.status !== 'scheduled') {
      throw new ValidationError(`Cannot start instance with status: ${instance.status}`)
    }

    // Update status and record actual start time
    const updated = await prisma.ritualInstance.update({
      where: { id: instanceId },
      data: {
        status: 'in_progress',
        actualStart: new Date(),
      },
    })

    // Emit event
    await eventEmitter.emit('instance.started', {
      instanceId: updated.id,
      templateId: updated.templateId,
      facilitatorId: updated.facilitatorId || undefined,
      participantCount: instance.participants.length,
    })

    logger.logRitualEvent('started', instanceId, {
      templateId: instance.template.id,
      participantCount: instance.participants.length,
    })
  }

  /**
   * Complete a ritual instance and trigger integrations
   */
  async completeInstance(instanceId: string): Promise<void> {
    const instance = await prisma.ritualInstance.findUnique({
      where: { id: instanceId },
      include: {
        template: true,
        participants: {
          where: {
            status: 'attended',
          },
        },
      },
    })

    if (!instance) {
      throw new NotFoundError('RitualInstance', instanceId)
    }

    if (instance.status !== 'in_progress') {
      throw new ValidationError(`Cannot complete instance with status: ${instance.status}`)
    }

    const actualEnd = new Date()
    const duration = instance.actualStart
      ? Math.round((actualEnd.getTime() - instance.actualStart.getTime()) / 60000)
      : undefined

    // Update status
    const updated = await prisma.ritualInstance.update({
      where: { id: instanceId },
      data: {
        status: 'completed',
        actualEnd,
      },
    })

    // Emit completion event (triggers notifications, rewards, quest progress)
    await eventEmitter.emit('instance.completed', {
      instanceId: updated.id,
      templateId: instance.template.id,
      templateKey: instance.template.key,
      ritualName: instance.template.name,
      facilitatorId: updated.facilitatorId || undefined,
      attendedParticipantIds: instance.participants.map(p => p.memberId),
      duration: duration || instance.template.defaultDurationMinutes || 60,
    })

    logger.logRitualEvent('completed', instanceId, {
      templateId: instance.template.id,
      attendedCount: instance.participants.length,
      duration,
    })
  }

  /**
   * Cancel a ritual instance
   */
  async cancelInstance(instanceId: string, reason?: string): Promise<void> {
    const instance = await prisma.ritualInstance.findUnique({
      where: { id: instanceId },
    })

    if (!instance) {
      throw new NotFoundError('RitualInstance', instanceId)
    }

    if (instance.status === 'completed' || instance.status === 'cancelled') {
      throw new ValidationError(`Cannot cancel instance with status: ${instance.status}`)
    }

    const updated = await prisma.ritualInstance.update({
      where: { id: instanceId },
      data: {
        status: 'cancelled',
        notesMarkdown: reason ? `Cancelled: ${reason}` : undefined,
      },
    })

    await eventEmitter.emit('instance.cancelled', {
      instanceId: updated.id,
      templateId: updated.templateId,
      reason,
    })

    logger.logRitualEvent('cancelled', instanceId, { reason })
  }

  /**
   * Check in a participant
   */
  async checkInParticipant(participantId: string): Promise<void> {
    const participant = await prisma.participantRegistration.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      throw new NotFoundError('ParticipantRegistration', participantId)
    }

    const checkInTime = new Date()

    const updated = await prisma.participantRegistration.update({
      where: { id: participantId },
      data: {
        status: 'attended',
        checkInAt: checkInTime,
      },
    })

    await eventEmitter.emit('participant.checkedIn', {
      instanceId: participant.ritualInstanceId,
      participantId: participant.id,
      memberId: participant.memberId,
      checkInTime,
    })

    logger.info('Participant checked in', {
      participantId,
      memberId: participant.memberId,
      instanceId: participant.ritualInstanceId,
    })
  }

  /**
   * Check out a participant
   */
  async checkOutParticipant(participantId: string): Promise<void> {
    const participant = await prisma.participantRegistration.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      throw new NotFoundError('ParticipantRegistration', participantId)
    }

    const checkOutTime = new Date()
    const duration = participant.checkInAt
      ? Math.round((checkOutTime.getTime() - participant.checkInAt.getTime()) / 60000)
      : 0

    await prisma.participantRegistration.update({
      where: { id: participantId },
      data: {
        checkOutAt: checkOutTime,
      },
    })

    await eventEmitter.emit('participant.checkedOut', {
      instanceId: participant.ritualInstanceId,
      participantId: participant.id,
      memberId: participant.memberId,
      checkOutTime,
      duration,
    })

    logger.info('Participant checked out', {
      participantId,
      memberId: participant.memberId,
      duration,
    })
  }

  /**
   * Get instance statistics
   */
  async getInstanceStats(instanceId: string) {
    const instance = await prisma.ritualInstance.findUnique({
      where: { id: instanceId },
      include: {
        participants: true,
        feedback: true,
        outcomes: true,
      },
    })

    if (!instance) {
      throw new NotFoundError('RitualInstance', instanceId)
    }

    const attendedCount = instance.participants.filter(p => p.status === 'attended').length
    const registeredCount = instance.participants.length
    const attendanceRate = registeredCount > 0 ? (attendedCount / registeredCount) * 100 : 0

    const avgRatings = instance.feedback.length > 0 ? {
      content: this.average(instance.feedback.map(f => f.contentRating).filter(Boolean) as number[]),
      facilitation: this.average(instance.feedback.map(f => f.facilitationRating).filter(Boolean) as number[]),
      energy: this.average(instance.feedback.map(f => f.energyRating).filter(Boolean) as number[]),
      value: this.average(instance.feedback.map(f => f.valueRating).filter(Boolean) as number[]),
    } : null

    return {
      instanceId: instance.id,
      status: instance.status,
      registeredCount,
      attendedCount,
      attendanceRate,
      feedbackCount: instance.feedback.length,
      outcomeCount: instance.outcomes.length,
      avgRatings,
    }
  }

  private average(numbers: number[]): number | null {
    if (numbers.length === 0) return null
    return numbers.reduce((a, b) => a + b, 0) / numbers.length
  }
}

// Singleton instance
export const ritualInstanceService = new RitualInstanceService()
