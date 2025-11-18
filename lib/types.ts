/**
 * Shared types for API responses and domain models
 */

import type {
  RitualTemplate,
  RitualStep,
  RitualInstance,
  ParticipantRegistration,
  OutcomeRecord,
  RitualType,
  StepType,
  InstanceStatus,
  ParticipantStatus
} from '@prisma/client'

// API Response wrappers
export interface ApiResponse<T> {
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

export interface ApiError {
  error: {
    message: string
    code?: string
    statusCode: number
    details?: unknown
  }
}

// Extended types with relations
export interface TemplateWithSteps extends RitualTemplate {
  steps: RitualStep[]
}

export interface TemplateWithCounts extends RitualTemplate {
  steps: RitualStep[]
  _count: {
    instances: number
  }
}

export interface InstanceWithRelations extends RitualInstance {
  template: TemplateWithSteps
  participants: ParticipantRegistration[]
  outcomes: OutcomeRecord[]
}

export interface InstanceSummary extends RitualInstance {
  template: {
    name: string
    ritualType: RitualType
  }
  _count: {
    participants: number
  }
}

// Input DTOs
export interface CreateTemplateInput {
  communityId: string
  key: string
  name: string
  descriptionMarkdown?: string
  ritualType: RitualType
  defaultDurationMinutes?: number
  defaultTagsJson?: string
}

export interface UpdateTemplateInput {
  name?: string
  descriptionMarkdown?: string
  ritualType?: RitualType
  defaultDurationMinutes?: number
  defaultTagsJson?: string
}

export interface CreateStepInput {
  orderIndex: number
  stepType: StepType
  title: string
  instructionsMarkdown?: string
  durationMinutes?: number
  metadataJson?: string
}

export interface CreateInstanceInput {
  templateId: string
  scheduledStart: string
  scheduledEnd: string
}

export interface UpdateInstanceInput {
  status?: InstanceStatus
  scheduledStart?: string
  scheduledEnd?: string
}

export interface RegisterParticipantInput {
  memberId: string
}

export interface UpdateParticipantInput {
  status?: ParticipantStatus
  checkIn?: boolean
  checkOut?: boolean
}

export interface CreateOutcomeInput {
  memberId: string
  notesMarkdown?: string
  rating?: number
  tagsJson?: string
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Paginated<T> = {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Re-export Prisma enums for convenience
export { RitualType, StepType, InstanceStatus, ParticipantStatus }
