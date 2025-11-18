/**
 * Analytics service for generating insights and reports
 */

import { prisma } from '../db'

export class AnalyticsService {
  /**
   * Get community-wide analytics
   */
  async getCommunityAnalytics(communityId: string, options?: {
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {
      template: {
        communityId,
      },
    }

    if (options?.startDate || options?.endDate) {
      where.scheduledStart = {}
      if (options.startDate) {
        where.scheduledStart.gte = options.startDate
      }
      if (options.endDate) {
        where.scheduledStart.lte = options.endDate
      }
    }

    const [
      totalInstances,
      completedInstances,
      totalParticipants,
      uniqueMembers,
      templates,
    ] = await Promise.all([
      prisma.ritualInstance.count({ where }),
      prisma.ritualInstance.count({
        where: { ...where, status: 'completed' },
      }),
      prisma.participantRegistration.count({
        where: {
          ritualInstance: where,
        },
      }),
      prisma.participantRegistration.findMany({
        where: {
          ritualInstance: where,
        },
        select: {
          memberId: true,
        },
        distinct: ['memberId'],
      }),
      prisma.ritualTemplate.count({
        where: { communityId },
      }),
    ])

    const attendedParticipants = await prisma.participantRegistration.count({
      where: {
        ritualInstance: where,
        status: 'attended',
      },
    })

    const attendanceRate = totalParticipants > 0
      ? (attendedParticipants / totalParticipants) * 100
      : 0

    const completionRate = totalInstances > 0
      ? (completedInstances / totalInstances) * 100
      : 0

    return {
      communityId,
      period: {
        start: options?.startDate,
        end: options?.endDate,
      },
      metrics: {
        totalInstances,
        completedInstances,
        completionRate,
        totalTemplates: templates,
        totalParticipants,
        attendedParticipants,
        attendanceRate,
        uniqueMembers: uniqueMembers.length,
        avgParticipantsPerRitual: totalInstances > 0
          ? totalParticipants / totalInstances
          : 0,
      },
    }
  }

  /**
   * Get popular rituals
   */
  async getPopularRituals(communityId: string, limit: number = 10) {
    const templates = await prisma.ritualTemplate.findMany({
      where: { communityId },
      include: {
        instances: {
          include: {
            participants: true,
          },
        },
      },
    })

    const ritualStats = templates.map(template => {
      const totalInstances = template.instances.length
      const completedInstances = template.instances.filter(i => i.status === 'completed').length
      const totalParticipants = template.instances.reduce(
        (sum, i) => sum + i.participants.length,
        0
      )
      const attendedParticipants = template.instances.reduce(
        (sum, i) => sum + i.participants.filter(p => p.status === 'attended').length,
        0
      )

      return {
        templateId: template.id,
        templateKey: template.key,
        name: template.name,
        ritualType: template.ritualType,
        totalInstances,
        completedInstances,
        totalParticipants,
        attendedParticipants,
        avgParticipants: totalInstances > 0 ? totalParticipants / totalInstances : 0,
        attendanceRate: totalParticipants > 0
          ? (attendedParticipants / totalParticipants) * 100
          : 0,
      }
    })

    // Sort by total participants
    return ritualStats
      .sort((a, b) => b.totalParticipants - a.totalParticipants)
      .slice(0, limit)
  }

  /**
   * Get member participation history
   */
  async getMemberParticipation(memberId: string, options?: {
    communityId?: string
    limit?: number
  }) {
    const where: any = {
      memberId,
    }

    if (options?.communityId) {
      where.ritualInstance = {
        template: {
          communityId: options.communityId,
        },
      }
    }

    const [participations, totalRegistered, totalAttended] = await Promise.all([
      prisma.participantRegistration.findMany({
        where,
        include: {
          ritualInstance: {
            include: {
              template: true,
            },
          },
        },
        orderBy: {
          registeredAt: 'desc',
        },
        take: options?.limit || 50,
      }),
      prisma.participantRegistration.count({ where }),
      prisma.participantRegistration.count({
        where: {
          ...where,
          status: 'attended',
        },
      }),
    ])

    return {
      memberId,
      totalRegistered,
      totalAttended,
      attendanceRate: totalRegistered > 0
        ? (totalAttended / totalRegistered) * 100
        : 0,
      participations: participations.map(p => ({
        instanceId: p.ritualInstanceId,
        ritualName: p.ritualInstance.template.name,
        ritualType: p.ritualInstance.template.ritualType,
        scheduledStart: p.ritualInstance.scheduledStart,
        status: p.status,
        registeredAt: p.registeredAt,
        checkInAt: p.checkInAt,
      })),
    }
  }

  /**
   * Get ritual series progress
   */
  async getSeriesProgress(seriesId: string) {
    const series = await prisma.ritualSeries.findUnique({
      where: { id: seriesId },
      include: {
        instances: {
          include: {
            participants: true,
          },
          orderBy: {
            scheduledStart: 'asc',
          },
        },
      },
    })

    if (!series) {
      return null
    }

    const totalInstances = series.instances.length
    const completedInstances = series.instances.filter(i => i.status === 'completed').length
    const upcomingInstances = series.instances.filter(i => i.status === 'scheduled').length

    const uniqueParticipants = new Set(
      series.instances.flatMap(i => i.participants.map(p => p.memberId))
    )

    return {
      seriesId: series.id,
      name: series.name,
      seriesType: series.seriesType,
      totalInstances,
      completedInstances,
      upcomingInstances,
      uniqueParticipants: uniqueParticipants.size,
      progressPercentage: totalInstances > 0
        ? (completedInstances / totalInstances) * 100
        : 0,
      instances: series.instances.map(i => ({
        id: i.id,
        scheduledStart: i.scheduledStart,
        status: i.status,
        participantCount: i.participants.length,
      })),
    }
  }

  /**
   * Get facilitator performance metrics
   */
  async getFacilitatorMetrics(facilitatorId: string) {
    const [instances, feedback] = await Promise.all([
      prisma.ritualInstance.findMany({
        where: { facilitatorId },
        include: {
          participants: true,
          template: true,
        },
      }),
      prisma.ritualFeedback.findMany({
        where: { facilitatorId },
      }),
    ])

    const totalRituals = instances.length
    const completedRituals = instances.filter(i => i.status === 'completed').length
    const totalParticipants = instances.reduce((sum, i) => i.participants.length + sum, 0)

    const avgRatings = feedback.length > 0 ? {
      facilitation: this.average(feedback.map(f => f.facilitationRating).filter(Boolean) as number[]),
      content: this.average(feedback.map(f => f.contentRating).filter(Boolean) as number[]),
      energy: this.average(feedback.map(f => f.energyRating).filter(Boolean) as number[]),
      value: this.average(feedback.map(f => f.valueRating).filter(Boolean) as number[]),
      overall: this.average([
        ...feedback.map(f => f.facilitationRating).filter(Boolean) as number[],
        ...feedback.map(f => f.contentRating).filter(Boolean) as number[],
        ...feedback.map(f => f.energyRating).filter(Boolean) as number[],
        ...feedback.map(f => f.valueRating).filter(Boolean) as number[],
      ]),
    } : null

    return {
      facilitatorId,
      totalRituals,
      completedRituals,
      totalParticipants,
      avgParticipantsPerRitual: totalRituals > 0 ? totalParticipants / totalRituals : 0,
      feedbackCount: feedback.length,
      avgRatings,
    }
  }

  private average(numbers: number[]): number | null {
    if (numbers.length === 0) return null
    return Math.round((numbers.reduce((a, b) => a + b, 0) / numbers.length) * 10) / 10
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService()
