/**
 * Domain event types for the ritual orchestrator
 * Events allow loose coupling and extensibility
 */

import type { RitualInstance, RitualTemplate, ParticipantRegistration } from '@prisma/client'

export interface BaseDomainEvent {
  eventId: string
  eventType: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// Template Events
export interface TemplateCreatedEvent extends BaseDomainEvent {
  eventType: 'template.created'
  payload: {
    templateId: string
    communityId: string
    key: string
    name: string
    ritualType: string
  }
}

export interface TemplateUpdatedEvent extends BaseDomainEvent {
  eventType: 'template.updated'
  payload: {
    templateId: string
    changes: string[]
  }
}

export interface TemplatePublishedEvent extends BaseDomainEvent {
  eventType: 'template.published'
  payload: {
    templateId: string
    communityId: string
  }
}

// Instance Events
export interface InstanceScheduledEvent extends BaseDomainEvent {
  eventType: 'instance.scheduled'
  payload: {
    instanceId: string
    templateId: string
    scheduledStart: Date
    scheduledEnd: Date
  }
}

export interface InstanceStartedEvent extends BaseDomainEvent {
  eventType: 'instance.started'
  payload: {
    instanceId: string
    templateId: string
    facilitatorId?: string
    participantCount: number
  }
}

export interface InstanceCompletedEvent extends BaseDomainEvent {
  eventType: 'instance.completed'
  payload: {
    instanceId: string
    templateId: string
    templateKey: string
    ritualName: string
    facilitatorId?: string
    attendedParticipantIds: string[]
    duration: number // minutes
  }
}

export interface InstanceCancelledEvent extends BaseDomainEvent {
  eventType: 'instance.cancelled'
  payload: {
    instanceId: string
    templateId: string
    reason?: string
  }
}

// Participant Events
export interface ParticipantRegisteredEvent extends BaseDomainEvent {
  eventType: 'participant.registered'
  payload: {
    instanceId: string
    participantId: string
    memberId: string
  }
}

export interface ParticipantCheckedInEvent extends BaseDomainEvent {
  eventType: 'participant.checkedIn'
  payload: {
    instanceId: string
    participantId: string
    memberId: string
    checkInTime: Date
  }
}

export interface ParticipantCheckedOutEvent extends BaseDomainEvent {
  eventType: 'participant.checkedOut'
  payload: {
    instanceId: string
    participantId: string
    memberId: string
    checkOutTime: Date
    duration: number // minutes
  }
}

// Feedback Events
export interface FeedbackSubmittedEvent extends BaseDomainEvent {
  eventType: 'feedback.submitted'
  payload: {
    feedbackId: string
    instanceId: string
    memberId: string
    facilitatorId?: string
    ratings: {
      content?: number
      facilitation?: number
      energy?: number
      value?: number
    }
  }
}

export interface OutcomeRecordedEvent extends BaseDomainEvent {
  eventType: 'outcome.recorded'
  payload: {
    outcomeId: string
    instanceId: string
    memberId: string
    rating?: number
  }
}

// Series Events
export interface SeriesCreatedEvent extends BaseDomainEvent {
  eventType: 'series.created'
  payload: {
    seriesId: string
    communityId: string
    name: string
    seriesType: string
  }
}

export interface SeriesCompletedEvent extends BaseDomainEvent {
  eventType: 'series.completed'
  payload: {
    seriesId: string
    communityId: string
    instanceCount: number
    participantCount: number
  }
}

// Union type of all events
export type DomainEvent =
  | TemplateCreatedEvent
  | TemplateUpdatedEvent
  | TemplatePublishedEvent
  | InstanceScheduledEvent
  | InstanceStartedEvent
  | InstanceCompletedEvent
  | InstanceCancelledEvent
  | ParticipantRegisteredEvent
  | ParticipantCheckedInEvent
  | ParticipantCheckedOutEvent
  | FeedbackSubmittedEvent
  | OutcomeRecordedEvent
  | SeriesCreatedEvent
  | SeriesCompletedEvent

export type EventType = DomainEvent['eventType']
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void
